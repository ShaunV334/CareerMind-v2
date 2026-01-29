-- Stage 2: Company-Specific Questions Schema
-- Handles company data, company-specific questions, and user company prep

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo_url VARCHAR(500),
  industry VARCHAR(100),
  founded_year INTEGER,
  headquarters VARCHAR(255),
  website_url VARCHAR(500),
  difficulty_rating DECIMAL(2, 1) DEFAULT 3.0,
  question_count INTEGER DEFAULT 0,
  interview_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  INDEX idx_company_name (name),
  INDEX idx_company_slug (slug),
  INDEX idx_company_industry (industry)
);

-- Company roles table
CREATE TABLE IF NOT EXISTS company_roles (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  role_name VARCHAR(255) NOT NULL,
  description TEXT,
  focus_areas VARCHAR(500),
  difficulty_level ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
  experience_level VARCHAR(50),
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_role (company_id, role_name),
  INDEX idx_company_id (company_id)
);

-- Company questions mapping
CREATE TABLE IF NOT EXISTS company_questions (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  aptitude_question_id INTEGER REFERENCES aptitude_questions(id) ON DELETE CASCADE,
  custom_question_text TEXT,
  question_source ENUM('aptitude', 'custom', 'leetcode', 'glassdoor') DEFAULT 'custom',
  frequency_score DECIMAL(3, 2) DEFAULT 1.0,
  asked_count INTEGER DEFAULT 0,
  avg_difficulty DECIMAL(2, 1),
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_company_role_id (company_role_id),
  INDEX idx_frequency (frequency_score DESC)
);

-- User company progress tracking
CREATE TABLE IF NOT EXISTS user_company_progress (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  prep_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  prep_completion_date TIMESTAMP,
  questions_attempted INTEGER DEFAULT 0,
  questions_completed INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5, 2),
  avg_time_per_question INTEGER,
  difficulty_completed ENUM('Easy', 'Medium', 'Hard'),
  status ENUM('Not Started', 'In Progress', 'Completed', 'Paused') DEFAULT 'Not Started',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_company (user_id, company_id),
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id)
);

-- Company-specific practice sessions
CREATE TABLE IF NOT EXISTS company_practice_sessions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  session_start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_end_time TIMESTAMP,
  duration_seconds INTEGER,
  total_questions INTEGER,
  questions_correct INTEGER,
  accuracy_percentage DECIMAL(5, 2),
  questions_skipped INTEGER DEFAULT 0,
  session_status ENUM('In Progress', 'Completed', 'Abandoned') DEFAULT 'In Progress',
  difficulty_filter ENUM('Easy', 'Medium', 'Hard', 'All') DEFAULT 'All',
  FOREIGN KEY fk_user_company (user_id, company_id) REFERENCES user_company_progress(user_id, company_id),
  INDEX idx_user_id (user_id),
  INDEX idx_company_id (company_id),
  INDEX idx_session_time (session_start_time DESC)
);

-- Company interview tips
CREATE TABLE IF NOT EXISTS company_interview_tips (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_role_id INTEGER REFERENCES company_roles(id) ON DELETE SET NULL,
  tip_category ENUM('Preparation', 'Interview', 'Negotiation', 'Culture Fit') DEFAULT 'Preparation',
  tip_text TEXT NOT NULL,
  author_user_id VARCHAR(255),
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company_id (company_id),
  INDEX idx_tip_category (tip_category)
);

-- Company comparison table (for benchmarking)
CREATE TABLE IF NOT EXISTS company_comparison_metrics (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  avg_preparation_time_days DECIMAL(5, 2),
  success_rate_percentage DECIMAL(5, 2),
  avg_interview_rounds INTEGER,
  avg_offer_rate DECIMAL(5, 2),
  trend_difficulty VARCHAR(20),
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_company_metrics (company_id),
  INDEX idx_company_id (company_id)
);
