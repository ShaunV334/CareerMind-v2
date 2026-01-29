-- Stage 3: Interview Experiences Schema
-- Handles user interview experiences, feedback, and interview preparation

-- Interview experiences table
CREATE TABLE IF NOT EXISTS interview_experiences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  interview_date DATE NOT NULL,
  interview_round INTEGER DEFAULT 1,
  interview_type ENUM('Phone Screen', 'Technical', 'System Design', 'Behavioral', 'Group Discussion', 'HR') DEFAULT 'Technical',
  duration_minutes INTEGER,
  interviewer_count INTEGER,
  difficulty_rating DECIMAL(2, 1),
  experience_rating DECIMAL(2, 1),
  outcome ENUM('Pass', 'Fail', 'Pending', 'Unknown') DEFAULT 'Pending',
  feedback TEXT,
  topics_discussed JSON,
  questions_asked JSON,
  user_performance JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_anonymous BOOLEAN DEFAULT false,
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_interview_date (interview_date DESC),
  INDEX idx_outcome (outcome)
);

-- Interview question history
CREATE TABLE IF NOT EXISTS interview_question_history (
  id SERIAL PRIMARY KEY,
  interview_experience_id INTEGER NOT NULL REFERENCES interview_experiences(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_category VARCHAR(100),
  user_answer TEXT,
  answer_quality ENUM('Poor', 'Fair', 'Good', 'Excellent', 'Not Attempted') DEFAULT 'Not Attempted',
  follow_up_questions JSON,
  interviewer_feedback TEXT,
  question_source ENUM('Company', 'LeetCode', 'GeeksforGeeks', 'Common', 'Custom') DEFAULT 'Company',
  difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
  INDEX idx_interview_id (interview_experience_id),
  INDEX idx_category (question_category)
);

-- Interview tips from real experiences
CREATE TABLE IF NOT EXISTS interview_tips_shared (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  interview_type ENUM('Phone Screen', 'Technical', 'System Design', 'Behavioral', 'Group Discussion', 'HR') DEFAULT 'Technical',
  tip_title VARCHAR(255) NOT NULL,
  tip_content TEXT NOT NULL,
  tip_category ENUM('Preparation', 'During Interview', 'Technical Tips', 'Behavioral Tips', 'General Advice') DEFAULT 'Preparation',
  confidence_level ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_interview_type (interview_type),
  INDEX idx_helpful (helpful_count DESC)
);

-- Interview preparation timeline
CREATE TABLE IF NOT EXISTS interview_preparation_plans (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  plan_name VARCHAR(255),
  start_date DATE NOT NULL,
  target_interview_date DATE,
  interview_date DATE,
  duration_days INTEGER,
  status ENUM('Planned', 'Active', 'Completed', 'Cancelled') DEFAULT 'Planned',
  completion_percentage DECIMAL(5, 2) DEFAULT 0,
  week_milestones JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_status (status)
);

-- Daily interview prep tasks
CREATE TABLE IF NOT EXISTS interview_daily_tasks (
  id SERIAL PRIMARY KEY,
  prep_plan_id INTEGER NOT NULL REFERENCES interview_preparation_plans(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  task_day_number INTEGER NOT NULL,
  task_title VARCHAR(255) NOT NULL,
  task_description TEXT,
  task_type ENUM('Practice Question', 'Topic Study', 'Mock Interview', 'Review', 'Company Research') DEFAULT 'Practice Question',
  difficulty_level ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
  estimated_duration_minutes INTEGER,
  resources JSON,
  is_completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP,
  performance_score DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY fk_user_prep (user_id, prep_plan_id) REFERENCES interview_preparation_plans(user_id, id),
  INDEX idx_prep_plan_id (prep_plan_id),
  INDEX idx_user_id (user_id),
  INDEX idx_task_day (task_day_number)
);

-- Mock interview sessions
CREATE TABLE IF NOT EXISTS mock_interview_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  prep_plan_id INTEGER REFERENCES interview_preparation_plans(id) ON DELETE SET NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  session_title VARCHAR(255),
  session_start_time TIMESTAMP NOT NULL,
  session_end_time TIMESTAMP,
  duration_seconds INTEGER,
  interview_type ENUM('Phone Screen', 'Technical', 'System Design', 'Behavioral', 'Group Discussion', 'HR') DEFAULT 'Technical',
  difficulty_level ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
  questions_count INTEGER,
  questions_correct INTEGER,
  accuracy_percentage DECIMAL(5, 2),
  feedback_given TEXT,
  audio_recording_url VARCHAR(500),
  transcript TEXT,
  session_status ENUM('In Progress', 'Completed', 'Abandoned') DEFAULT 'In Progress',
  rating_by_user DECIMAL(2, 1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_prep_plan_id (prep_plan_id),
  INDEX idx_session_time (session_start_time DESC)
);

-- Interview feedback from peers/mentors
CREATE TABLE IF NOT EXISTS interview_feedback (
  id SERIAL PRIMARY KEY,
  interview_experience_id INTEGER REFERENCES interview_experiences(id) ON DELETE CASCADE,
  mock_interview_session_id INTEGER REFERENCES mock_interview_sessions(id) ON DELETE CASCADE,
  feedback_from_user_id VARCHAR(255),
  feedback_text TEXT NOT NULL,
  feedback_category ENUM('Strengths', 'Areas to Improve', 'Technical', 'Behavioral', 'Communication') DEFAULT 'Strengths',
  rating DECIMAL(2, 1),
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_experience_id (interview_experience_id),
  INDEX idx_mock_session_id (mock_interview_session_id),
  INDEX idx_feedback_from (feedback_from_user_id)
);

-- Interview outcome tracking
CREATE TABLE IF NOT EXISTS interview_outcomes (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  interview_count INTEGER DEFAULT 1,
  final_outcome ENUM('Offer Received', 'Rejected', 'Pending', 'Passed Round', 'No Feedback') DEFAULT 'Pending',
  salary_offered DECIMAL(12, 2),
  salary_currency VARCHAR(10),
  stock_options DECIMAL(10, 4),
  bonus DECIMAL(12, 2),
  negotiation_success_rate DECIMAL(5, 2),
  offer_acceptance_date DATE,
  joining_date DATE,
  feedback_received TEXT,
  rating_overall DECIMAL(2, 1),
  would_recommend BOOLEAN,
  lessons_learned TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_company_outcome (user_id, company_id),
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_outcome (final_outcome)
);
