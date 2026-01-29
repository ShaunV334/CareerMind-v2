// backend/src/db/schema/aptitude.sql

-- Aptitude Categories (top-level organization)
CREATE TABLE IF NOT EXISTS aptitude_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  order_index INT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aptitude Subcategories (e.g., "Numbers" under "Quantitative Aptitude")
CREATE TABLE IF NOT EXISTS aptitude_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES aptitude_categories(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  order_index INT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, name)
);

-- Aptitude Questions (main question table)
CREATE TABLE IF NOT EXISTS aptitude_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES aptitude_categories(id),
  subcategory_id UUID NOT NULL REFERENCES aptitude_subcategories(id),
  title VARCHAR(500) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50), -- "multiple-choice", "numerical", "short-answer"
  difficulty VARCHAR(20), -- "Easy", "Medium", "Hard"
  
  -- Content fields
  explanation TEXT,
  solution_steps TEXT[], -- Array of step-by-step solution
  formula_used VARCHAR(500),
  related_concepts TEXT[], -- Array of concept names
  
  -- Statistics
  views INT DEFAULT 0,
  attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  average_time_spent INT, -- in seconds
  difficulty_rating DECIMAL(2,1), -- 1-5 rating from users
  
  -- Metadata
  tags TEXT[],
  external_source_url VARCHAR(500),
  source_attribution VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Multiple Choice Options
CREATE TABLE IF NOT EXISTS aptitude_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES aptitude_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_label VARCHAR(2), -- A, B, C, D
  is_correct BOOLEAN DEFAULT false,
  explanation VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Responses to Aptitude Questions
CREATE TABLE IF NOT EXISTS user_aptitude_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES aptitude_questions(id),
  selected_option_id UUID REFERENCES aptitude_question_options(id),
  is_correct BOOLEAN,
  time_spent_seconds INT,
  attempt_number INT DEFAULT 1,
  skipped BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, question_id, attempt_number)
);

-- Aptitude Practice Sessions (user solving multiple questions)
CREATE TABLE IF NOT EXISTS aptitude_practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES aptitude_categories(id),
  subcategory_id UUID REFERENCES aptitude_subcategories(id),
  difficulty_filter VARCHAR(50), -- Filter used for session
  question_count INT,
  time_limit_seconds INT, -- NULL if no time limit
  
  -- Session stats
  total_questions INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  skipped INT DEFAULT 0,
  partial_credit INT DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),
  average_time_per_question INT,
  total_time_spent INT,
  
  status VARCHAR(20), -- "in-progress", "completed", "abandoned"
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookmarked Questions (user-specific)
CREATE TABLE IF NOT EXISTS user_bookmarked_aptitude_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES aptitude_questions(id) ON DELETE CASCADE,
  folder_name VARCHAR(100) DEFAULT 'General',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, question_id)
);

-- User Progress Tracking
CREATE TABLE IF NOT EXISTS user_aptitude_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  
  -- Category-level stats
  category_stats JSONB, -- {categoryId: {correct, total, accuracy}}
  subcategory_stats JSONB, -- {subcategoryId: {correct, total, accuracy}}
  
  -- Overall stats
  total_questions_attempted INT DEFAULT 0,
  total_correct_answers INT DEFAULT 0,
  overall_accuracy DECIMAL(5,2),
  
  -- Streak tracking
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  
  -- Time spent
  total_minutes_spent INT DEFAULT 0,
  
  -- User preferences
  preferred_difficulty VARCHAR(20),
  preferred_question_type VARCHAR(50),
  preferred_category_id UUID,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Analytics (pre-computed for dashboards)
CREATE TABLE IF NOT EXISTS aptitude_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES aptitude_categories(id),
  subcategory_id UUID REFERENCES aptitude_subcategories(id),
  difficulty VARCHAR(20),
  
  -- Aggregate metrics
  total_attempts INT DEFAULT 0,
  correct_attempts INT DEFAULT 0,
  average_accuracy DECIMAL(5,2),
  average_time_spent INT,
  total_users_attempted INT DEFAULT 0,
  
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, subcategory_id, difficulty, date)
);

-- Create indexes for performance
CREATE INDEX idx_apt_cat_active ON aptitude_categories(active);
CREATE INDEX idx_apt_subcat_cat ON aptitude_subcategories(category_id);
CREATE INDEX idx_apt_q_category ON aptitude_questions(category_id);
CREATE INDEX idx_apt_q_subcategory ON aptitude_questions(subcategory_id);
CREATE INDEX idx_apt_q_difficulty ON aptitude_questions(difficulty);
CREATE INDEX idx_apt_q_tags ON aptitude_questions USING GIN(tags);
CREATE INDEX idx_user_apt_resp_user ON user_aptitude_responses(user_id);
CREATE INDEX idx_user_apt_resp_question ON user_aptitude_responses(question_id);
CREATE INDEX idx_user_apt_session_user ON aptitude_practice_sessions(user_id);
CREATE INDEX idx_user_bookmarked_user ON user_bookmarked_aptitude_questions(user_id);
CREATE INDEX idx_user_apt_progress_user ON user_aptitude_progress(user_id);
CREATE INDEX idx_apt_analytics_date ON aptitude_analytics(date);
