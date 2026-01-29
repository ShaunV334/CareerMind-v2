# CareerMind-Reloaded: Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Backend Analysis](#backend-analysis)
4. [Frontend Analysis](#frontend-analysis)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Technology Stack](#technology-stack)
7. [Design Patterns](#design-patterns)
8. [Potential Advancement Areas](#potential-advancement-areas)

---

## Project Overview

**CareerMind** is a full-stack web application designed to help users prepare for career advancement through a structured learning and assessment platform. It combines resume building, interview preparation, question banks, study materials, and task management into one cohesive platform.

### Core Purpose
- **Resume Management**: Build, edit, and manage professional resumes
- **Interview Preparation**: Practice with mock interviews and track progress
- **Question Bank**: Access curated technical and behavioral questions
- **Study Materials**: Organize and access learning resources
- **Task Management**: Track weekly tasks and progress
- **Community**: Group discussions for collaborative learning

### Target Users
- Career changers
- Job seekers preparing for interviews
- Students learning technical skills
- Professionals upskilling

---

## Architecture Overview

```
CareerMind-Reloaded/
├── Backend (Node.js/Hono + TypeScript)
│   ├── Database connections
│   ├── REST API endpoints
│   ├── Authentication/Authorization
│   └── Business logic
│
└── Frontend (Next.js 14 + React + TypeScript + Tailwind CSS)
    ├── UI Components
    ├── Page routing
    ├── State management
    └── API integration
```

**Architecture Pattern**: Client-Server Architecture with REST API

The application follows a **separation of concerns** approach:
- **Backend**: Handles data logic, business rules, authentication, database operations
- **Frontend**: Manages UI, user experience, client-side state, API consumption

---

## Backend Analysis

### Directory Structure
```
backend/
├── src/
│   ├── db.ts               # Database configuration & connection
│   ├── index.ts            # Hono server entry point
│   ├── middleware.ts       # Middleware setup (auth, CORS, logging, etc.)
│   ├── routes/             # Feature-based API endpoints
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── interview.ts    # Interview management
│   │   ├── questions.ts    # Question bank
│   │   ├── resumes.ts      # Resume management
│   │   └── tasks.ts        # Task management
│   └── seeds/              # Database seeding scripts
│       ├── seed.ts         # Main seed orchestrator
│       ├── questions.ts    # Sample questions
│       ├── interview-questions.ts
│       └── seed-interview.ts
├── package.json
├── tsconfig.json
└── README.md
```

### 1. Core Setup Files

#### `src/index.ts` - Entry Point
- Main server initialization
- Hono app setup with routes
- Database connection initialization
- Middleware registration
- Route mounting
- Server listening on configured port

#### `src/db.ts` - Database Configuration
- Database connection pool management
- ORM/query builder initialization (likely Prisma or TypeORM)
- Singleton pattern: ensures one database connection throughout app lifecycle
- Export database client for use across all routes

**Key Pattern**: Single responsibility - manages all database-related setup

### 2. Middleware System (`src/middleware.ts`)

Middleware are functions that process requests before they reach route handlers.

**Request Flow**: `Request → Middleware → Route Handler → Response`

**Typical Middleware Includes**:
```
- Authentication middleware (JWT verification)
- CORS handling (allow frontend to communicate)
- Error handling (catch and format errors)
- Request logging (track API usage)
- Request/response validation
- Rate limiting
```

### 3. Route Structure (`src/routes/`)

The backend uses **modular, feature-based routing** where each feature has its own file.

#### **Authentication Routes** (`auth.ts`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/signup` | Create new user account |
| POST | `/auth/login` | Authenticate user, return JWT |
| POST | `/auth/logout` | Invalidate session |
| POST | `/auth/refresh` | Refresh expired JWT tokens |
| GET | `/auth/profile` | Get current user info |

**Authentication Flow**:
1. User submits email/password via signup form
2. Server validates input and checks if user exists
3. Hash password using bcrypt (never store plain passwords)
4. Store user in database
5. Generate JWT token (signed token with user ID + claims)
6. Return token to frontend for storage

**JWT (JSON Web Token)**:
- Compact, self-contained token
- Contains user claims (ID, email, role)
- Digitally signed by server
- Sent with every subsequent request in `Authorization: Bearer <token>` header
- Server validates signature to ensure legitimacy

#### **Interview Routes** (`interview.ts`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/interview` | Create new interview session |
| GET | `/interview/:id` | Retrieve specific interview |
| GET | `/interview/user/:userId` | Get all interviews for user |
| PUT | `/interview/:id` | Update interview progress |
| POST | `/interview/:id/answer` | Submit answer to question |

**Interview Session Structure**:
```typescript
{
  id: string,
  userId: string,
  status: "in-progress" | "completed" | "paused",
  questions: Array<{
    questionId: string,
    order: number,
    answer: string,
    timeSpent: number (seconds),
    score: number
  }>,
  startTime: Date,
  endTime: Date,
  totalScore: number,
  feedback: string,
  createdAt: Date,
  updatedAt: Date
}
```

**Interview Flow**:
1. User clicks "Start Interview" on frontend
2. POST request creates interview session
3. Server randomly selects 10-15 questions from database
4. Frontend displays questions one at a time
5. For each answer: POST with answer + metadata (time spent)
6. Server stores answer immediately
7. After final answer: Interview marked complete
8. Server calculates total score and generates feedback
9. User sees results dashboard with performance metrics

#### **Questions Routes** (`questions.ts`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/questions` | Get question bank (with filters) |
| GET | `/questions/:id` | Get specific question details |
| POST | `/questions` | Admin: Add new question |
| PUT | `/questions/:id` | Admin: Update question |
| DELETE | `/questions/:id` | Admin: Remove question |
| GET | `/questions/search` | Search/filter questions by category, difficulty, keyword |

**Question Data Model**:
```typescript
{
  id: string,
  title: string,
  description: string,
  category: string (e.g., "JavaScript", "System Design", "Behavioral"),
  difficulty: "easy" | "medium" | "hard",
  type: "multiple-choice" | "coding" | "essay" | "short-answer",
  content: string,
  options?: Array<string>, // for multiple-choice
  correctAnswer?: string,
  explanation: string,
  tags: Array<string>,
  difficulty: number (1-5),
  views: number,
  savedCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

**Filtering Capabilities**:
- By category (JavaScript, Python, System Design, etc.)
- By difficulty (easy, medium, hard)
- By type (multiple choice, coding, essay)
- By tags
- Search by keyword

#### **Resumes Routes** (`resumes.ts`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/resumes` | Create new resume |
| GET | `/resumes/:id` | Retrieve resume |
| GET | `/resumes/user/:userId` | Get user's all resumes |
| PUT | `/resumes/:id` | Update resume |
| DELETE | `/resumes/:id` | Delete resume |

**Resume Data Model**:
```typescript
{
  id: string,
  userId: string,
  title: string (e.g., "Software Engineer Resume 2026"),
  sections: {
    personalInfo: {
      name: string,
      email: string,
      phone: string,
      location: string,
      portfolio?: string,
      linkedin?: string
    },
    summary: string (professional summary),
    experience: Array<{
      id: string,
      jobTitle: string,
      company: string,
      startDate: Date,
      endDate: Date,
      currentlyWorking: boolean,
      description: string,
      keyAchievements: Array<string>
    }>,
    education: Array<{
      id: string,
      degree: string (e.g., "Bachelor of Science"),
      field: string (e.g., "Computer Science"),
      institution: string,
      graduationYear: number,
      gpa?: number
    }>,
    skills: Array<{
      id: string,
      name: string,
      proficiency: "Beginner" | "Intermediate" | "Expert"
    }>,
    projects: Array<{
      id: string,
      name: string,
      description: string,
      technologies: Array<string>,
      link?: string,
      startDate: Date,
      endDate: Date
    }>,
    certifications: Array<{
      id: string,
      name: string,
      issuer: string,
      issueDate: Date,
      expirationDate?: Date,
      link?: string
    }>
  },
  template: string (design template),
  createdAt: Date,
  updatedAt: Date
}
```

**Resume Features**:
- Multiple resume support (user can have different resumes)
- Full edit capability for all sections
- Template selection for design
- Versioning (track changes)
- Export functionality (PDF, Word, JSON)

#### **Tasks Routes** (`tasks.ts`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/tasks` | Create task |
| GET | `/tasks` | Get user's tasks (with optional filters) |
| PUT | `/tasks/:id` | Update task status/details |
| DELETE | `/tasks/:id` | Complete/remove task |

**Task Data Model**:
```typescript
{
  id: string,
  userId: string,
  title: string,
  description: string,
  category: "interview" | "study" | "resume" | "discussion" | "other",
  dueDate: Date,
  status: "pending" | "in-progress" | "completed",
  priority: "low" | "medium" | "high",
  assignedBy?: string (for assigned tasks),
  tags: Array<string>,
  estimatedHours?: number,
  actualHours?: number,
  progress: number (0-100),
  subtasks?: Array<{
    id: string,
    title: string,
    completed: boolean
  }>,
  createdAt: Date,
  updatedAt: Date,
  completedAt?: Date
}
```

**Task Management Features**:
- Weekly task tracking
- Priority-based organization
- Progress tracking
- Subtasks for complex tasks
- Due date reminders
- Status transitions (pending → in-progress → completed)

### 4. Database Seeds (`src/seeds/`)

**Purpose**: Pre-populate database with initial/demo data

**Files**:
- `seed.ts` - Main orchestrator that runs all seed functions
- `questions.ts` - Sample questions for question bank (technical, behavioral, coding)
- `interview-questions.ts` - Specific questions configured for interview mode
- `seed-interview.ts` - Pre-configured interview templates

**Why Seeds Are Important**:
1. **Testing**: Ensures consistent test data
2. **Demo Data**: Provides demo content for new users
3. **Baseline Data**: Establishes minimum viable data set
4. **Reproducibility**: Can recreate database state anywhere
5. **Development**: Speeds up development with realistic data

**Typical Seed Pattern**:
```typescript
// seed.ts
async function main() {
  await seedQuestions();
  await seedInterviewQuestions();
  await seedInterviewTemplates();
  console.log("Database seeded successfully!");
}

main().catch(console.error);
```

---

## Frontend Analysis

### Directory Structure
```
frontend/
├── app/                    # Next.js 14 App Router (file-based routing)
│   ├── layout.tsx          # Root layout wrapper
│   ├── page.tsx            # Homepage (/)
│   ├── login/
│   │   └── page.tsx        # (/login)
│   ├── signup/
│   │   └── page.tsx        # (/signup)
│   ├── hero/
│   │   └── page.tsx        # (/hero) - marketing page
│   └── dashboard/          # Protected route /dashboard
│       ├── layout.tsx      # Dashboard layout with sidebar
│       ├── page.tsx        # Dashboard home
│       ├── resume/
│       │   └── page.tsx    # Resume builder & list
│       ├── interview/
│       │   └── page.tsx    # Interview practice
│       ├── questions/
│       │   └── page.tsx    # Question bank view
│       ├── question-bank/
│       │   └── page.tsx    # Alternative questions view
│       ├── study-materials/
│       │   └── page.tsx    # Learning resources
│       ├── weekly-tasks/
│       │   └── page.tsx    # Task management
│       └── group-discussions/
│           └── page.tsx    # Community discussions
├── components/             # React components
│   ├── app-sidebar.tsx
│   ├── login-form.tsx
│   ├── signup-form.tsx
│   ├── ResumeBuilder.tsx
│   ├── ResumeList.tsx
│   ├── Navbar.tsx
│   ├── theme-provider.tsx
│   ├── protected-route.tsx
│   ├── nav-main.tsx
│   ├── nav-projects.tsx
│   ├── nav-user.tsx
│   ├── ModeToggle.tsx
│   ├── team-switcher.tsx
│   └── ui/                 # shadcn/ui component library
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── alert.tsx
│       ├── badge.tsx
│       ├── avatar.tsx
│       ├── dropdown-menu.tsx
│       ├── tabs.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── tooltip.tsx
│       └── other UI components...
├── hooks/                  # Custom React hooks
│   ├── useInterview.ts
│   ├── useQuestions.ts
│   ├── useResumeData.ts
│   ├── useTasks.ts
│   └── use-mobile.ts
├── lib/                    # Utility functions & context
│   ├── auth-context.tsx    # Global auth state
│   └── utils.ts
├── utils/                  # Helper functions
│   └── dateHelpers.ts
├── types/                  # TypeScript type definitions
│   └── task.ts
├── public/                 # Static assets (images, fonts, etc.)
├── globals.css             # Global styles
├── layout.tsx              # App root layout
├── page.tsx                # App root page
└── next.config.ts          # Next.js configuration
```

### 1. Routing System (Next.js App Router)

**Next.js 14 uses file-based routing**:
- Folders become URL segments
- `page.tsx` is the route component
- `layout.tsx` wraps child routes

**Examples**:
| File | URL |
|------|-----|
| `app/page.tsx` | `/` (homepage) |
| `app/login/page.tsx` | `/login` |
| `app/dashboard/page.tsx` | `/dashboard` |
| `app/dashboard/resume/page.tsx` | `/dashboard/resume` |
| `app/dashboard/interview/page.tsx` | `/dashboard/interview` |

### 2. Layout System

#### **Root Layout** (`app/layout.tsx`)
```typescript
// Defines global HTML structure
// Wraps ALL pages with:
- DOCTYPE, meta tags, fonts
- ThemeProvider (dark/light mode toggle)
- AuthContext (global user state)
- Global CSS imports

// Typical structure:
<html>
  <head>...</head>
  <body>
    <Providers>  {/* Theme + Auth context */}
      {children}  {/* Page content */}
    </Providers>
  </body>
</html>
```

**Key Insight**: Everything passes through this layout, so global setup happens here.

#### **Dashboard Layout** (`app/dashboard/layout.tsx`)
```typescript
// Wraps all /dashboard/* routes
// Provides:
- Sidebar navigation
- Top navbar
- Mobile responsive menu
- Protected route check
- User menu

// Typical structure:
<DashboardContainer>
  <Sidebar />
  <MainContent>
    <Navbar />
    {children}  {/* Specific dashboard page */}
  </MainContent>
</DashboardContainer>
```

### 3. Public Pages

#### **Homepage** (`app/page.tsx`)
- Landing page for unauthenticated users
- Marketing content
- Sign up / Login CTAs
- Feature overview

#### **Hero Page** (`app/hero/page.tsx`)
- Marketing/information page
- Detailed feature descriptions
- Benefits and value proposition
- Call-to-action buttons

#### **Login Page** (`app/login/page.tsx`)
```typescript
// Components:
- Email input
- Password input
- "Remember me" checkbox
- Error message display
- Login button
- "Forgot password" link
- "Sign up" link

// Flow:
1. User submits credentials
2. login-form.tsx validates locally
3. POST to /api/auth/login
4. Backend validates against database
5. Success: JWT token returned
6. Frontend: stores JWT in localStorage/cookie
7. Update AuthContext with user data
8. Redirect to /dashboard
```

#### **Signup Page** (`app/signup/page.tsx`)
```typescript
// Components:
- Name input
- Email input
- Password input
- Confirm password input
- Terms & conditions checkbox
- Error/success messages
- Signup button
- "Already have account?" link

// Flow:
1. User enters information
2. signup-form.tsx validates
3. POST to /api/auth/signup
4. Backend: creates user account
5. Backend: generates JWT
6. Frontend: auto-logs in user
7. Update AuthContext
8. Redirect to /dashboard
```

### 4. Dashboard Pages (Protected Routes)

All dashboard routes are protected - user must be authenticated.

#### **Protection Mechanism** (`components/protected-route.tsx`)
```typescript
// Higher-Order Component that:
// 1. Checks AuthContext for user
// 2. Verifies JWT token hasn't expired
// 3. If not authenticated: redirect to /login
// 4. If authenticated: render page content

// Pseudo code:
if (!isAuthenticated) {
  redirect('/login');
}
return <PageContent />;
```

#### **Dashboard Home** (`app/dashboard/page.tsx`)
- Overview/welcome page
- Quick stats (interviews completed, questions attempted)
- Recent activity
- Quick action buttons to features
- Upcoming tasks

#### **Resume Section** (`app/dashboard/resume/page.tsx`)
```typescript
// Two main components:
1. ResumeBuilder - Form to create/edit resumes
2. ResumeList - Display all user resumes

// ResumeBuilder Features:
- Multi-section form (personal, experience, education, etc.)
- Real-time form state tracking (no need to save to backend until final submit)
- Form validation for each section
- Add/edit/remove items in array sections (experiences, skills, etc.)
- Template selection
- Preview panel

// ResumeList Features:
- Display all user resumes
- Edit button → opens ResumeBuilder with pre-filled data
- Delete button → with confirmation
- Download button → export as PDF/Word
- Duplicate button → copy resume
```

#### **Interview Section** (`app/dashboard/interview/page.tsx`)
```typescript
// Interview Practice Page
// Flow:
1. Display list of available interview types
2. User selects interview type or clicks "Start Interview"
3. Initialize interview session via useInterview hook
4. Display question counter (e.g., "Question 3 of 10")
5. Show current question with:
   - Question text
   - Question type indicator
   - Answer input (textarea for essay, multiple choice buttons, etc.)
6. Timer showing time spent on current question
7. Navigation buttons:
   - Next question
   - Previous question (optional)
   - Save & Exit
   - Submit Interview
8. After completion:
   - Calculate score
   - Display results dashboard
   - Show feedback on answers
   - Option to review answers
   - Option to start new interview
```

#### **Question Bank** (`app/dashboard/questions/page.tsx` & `app/dashboard/question-bank/page.tsx`)
```typescript
// Two views of the same data
// Features:
- List of questions with:
  - Title
  - Category
  - Difficulty badge
  - Question type icon
  - View count
  - Bookmark button
- Filters:
  - Category dropdown
  - Difficulty slider
  - Question type buttons
  - Search input
- Actions:
  - Click to view full question
  - Bookmark for later study
  - Mark as studied
  - Filter/sort options
- Full Question View:
  - Complete question text
  - Answer explanation
  - Related questions
  - Difficulty rating
  - Tags
```

#### **Study Materials** (`app/dashboard/study-materials/page.tsx`)
```typescript
// Resource organization page
// Features:
- Curated study guides
- Video links
- Articles/tutorials
- Documentation links
- Book recommendations
- Organized by:
  - Category
  - Difficulty
  - Skill level
- Bookmarking/saving
- Progress tracking
```

#### **Weekly Tasks** (`app/dashboard/weekly-tasks/page.tsx`)
```typescript
// Task Management Page
// Components:
- Task creation form
- Task list filtered by status:
  - Pending
  - In Progress
  - Completed
- For each task:
  - Title
  - Category badge
  - Priority indicator (color-coded)
  - Due date
  - Progress bar (if applicable)
  - Actions: Edit, Delete, Mark Complete
- Sorting options:
  - By due date
  - By priority
  - By status
- Filtering options:
  - By category
  - By priority
  - By status
- Week view with upcoming tasks
- Completion statistics
```

#### **Group Discussions** (`app/dashboard/group-discussions/page.tsx`)
```typescript
// Community Discussion Forum
// Features:
- List of discussion threads
- Create new thread button
- Thread view:
  - Original post
  - Comments/replies
  - User avatars
  - Timestamps
  - Like/upvote button
  - Reply button
- Search discussions
- Filter by category
- Sort by newest/most active
- User reputation system (optional)
```

### 5. Component Architecture

#### **Layout Components**

**AppSidebar** (`components/app-sidebar.tsx`)
```typescript
// Persistent left sidebar (or collapsible on mobile)
// Contains:
- User profile section
  - Avatar
  - User name
  - User email
- Main navigation links
  - Dashboard
  - Resume
  - Interview
  - Questions
  - Study Materials
  - Tasks
  - Discussions
- Secondary navigation (nav-main.tsx, nav-projects.tsx)
- User menu (nav-user.tsx)
  - Profile settings
  - Preferences
  - Logout
- Theme toggle (ModeToggle.tsx)

// Uses shadcn/ui Sidebar component
```

**Navigation Components**
- `nav-main.tsx` - Primary navigation links
- `nav-projects.tsx` - Project/workspace navigation
- `nav-user.tsx` - User menu (settings, logout, etc.)

**Navbar** (`components/Navbar.tsx`)
```typescript
// Top header navigation
// Contains:
- App logo/title
- Search bar
- Notification bell
- User quick menu
- Responsive hamburger menu (mobile)

// Responsive:
- Desktop: Full navbar visible
- Mobile: Hamburger menu, minimal content
```

#### **Authentication Components**

**LoginForm** (`components/login-form.tsx`)
```typescript
// Form handling:
- Email input with validation
- Password input with show/hide toggle
- Remember me checkbox
- Submit button (shows loading state)
- Error message display
- Link to signup page
- Forgot password link

// Validation:
- Email format check
- Password required
- Show inline error messages

// On Submit:
- Call login API endpoint
- Store JWT token
- Update AuthContext
- Redirect to dashboard
```

**SignupForm** (`components/signup-form.tsx`)
```typescript
// Form handling:
- Name input
- Email input with validation
- Password input with requirements indicator
- Confirm password with match validation
- Terms & conditions checkbox
- Email verification (optional)
- Submit button

// Validation:
- All fields required
- Email uniqueness check (optional backend validation)
- Password strength requirements
- Password confirmation match
- Terms acceptance

// On Submit:
- POST to signup endpoint
- Auto-login with returned JWT
- Update AuthContext
- Redirect to dashboard
```

#### **Feature Components**

**ResumeBuilder** (`components/ResumeBuilder.tsx`)
```typescript
// Comprehensive resume creation/editing form
// Sections:
1. Personal Information
   - Name, email, phone, location
   - Portfolio link, LinkedIn
2. Professional Summary
   - Text area for summary
3. Experience (Array)
   - Job title, company, dates
   - Description, achievements
   - Add/edit/remove buttons
4. Education (Array)
   - Degree, field, institution
   - Graduation year, GPA
   - Add/edit/remove buttons
5. Skills (Array)
   - Skill name, proficiency level
   - Add/edit/remove buttons
6. Projects (Array)
   - Project name, description
   - Technologies, links
   - Add/edit/remove buttons
7. Certifications (Array)
   - Certification name, issuer
   - Dates, links

// Features:
- Form state managed by useResumeData hook
- Real-time validation
- Preview panel (optional)
- Auto-save to localStorage
- Template selector
- Save to backend button
```

**ResumeList** (`components/ResumeList.tsx`)
```typescript
// Display all user resumes
// For each resume:
- Resume title
- Created/updated date
- Quick action buttons:
  - Edit (→ ResumeBuilder)
  - View/Preview
  - Download (PDF/Word)
  - Duplicate
  - Delete (with confirmation)
- Resume thumbnail/preview

// Features:
- Grid or list view
- Search resumes
- Filter by creation date
- Sort options
```

#### **UI Component Library** (`components/ui/`)

**shadcn/ui Components** - Headless, unstyled components built with Radix UI

| Component | Purpose |
|-----------|---------|
| `button.tsx` | Clickable button with variants (primary, secondary, outline, ghost) |
| `input.tsx` | Text input field with styling |
| `card.tsx` | Container box with card styling and shadow |
| `alert.tsx` | Alert/notification boxes (success, error, warning, info) |
| `badge.tsx` | Small tag/label element (category, difficulty, status) |
| `avatar.tsx` | User profile picture with fallback |
| `dropdown-menu.tsx` | Context menu with options |
| `tabs.tsx` | Tab navigation between content sections |
| `sheet.tsx` | Side drawer/modal panel |
| `sidebar.tsx` | Navigation sidebar component |
| `skeleton.tsx` | Loading placeholder shapes |
| `label.tsx` | Form field label with accessibility |
| `progress.tsx` | Progress bar/indicator |
| `tooltip.tsx` | Hover tooltip with information |
| `separator.tsx` | Visual divider line |
| `breadcrumb.tsx` | Breadcrumb navigation trail |
| `collapsible.tsx` | Expand/collapse section |
| `navigation-menu.tsx` | Main navigation menu |

**Key Pattern**: These are **headless** - structure without opinionated styling, fully customizable with Tailwind CSS.

### 6. Custom Hooks

React Hooks encapsulate reusable logic and state management.

#### **useInterview.ts**
```typescript
// Interview session management
// State:
- currentInterview: Interview object
- currentQuestion: Question object
- questionIndex: number (which question we're on)
- answers: Array<Answer> (user's answers)
- isLoading: boolean
- error: string | null
- timeSpent: number (seconds on current question)

// Functions:
- startInterview(type: string): void
  - POST /interview with type
  - Initialize interview session
- getNextQuestion(): Question
- getPreviousQuestion(): Question
- submitAnswer(answer: string): void
  - POST /interview/:id/answer
  - Move to next question
- completeInterview(): void
  - POST /interview/:id/complete
  - Calculate score, get feedback
- getCurrentScore(): number
- getTimeSpent(): number

// Usage Example:
const { interview, currentQuestion, submitAnswer } = useInterview();
```

#### **useQuestions.ts**
```typescript
// Question bank management
// State:
- questions: Array<Question>
- currentFilters: FilterOptions
- searchTerm: string
- isLoading: boolean
- error: string | null
- selectedCategory: string
- selectedDifficulty: string

// Functions:
- fetchQuestions(filters): void
  - GET /questions with filters
- searchQuestions(term: string): void
  - Filter questions by search
- setCategory(category: string): void
- setDifficulty(difficulty: string): void
- getQuestion(id: string): Question
- bookmarkQuestion(questionId: string): void
  - POST to save bookmark
- removeBookmark(questionId: string): void
- getBookmarkedQuestions(): Array<Question>

// Usage Example:
const { questions, searchQuestions, bookmarkQuestion } = useQuestions();
```

#### **useResumeData.ts**
```typescript
// Resume form state management
// State:
- resumeData: ResumeObject
- isLoading: boolean
- error: string | null
- isDirty: boolean (form changed but not saved)
- validationErrors: Object

// Functions:
- loadResume(resumeId: string): void
- initializeNewResume(): void
- updatePersonalInfo(data): void
- addExperience(experience): void
- removeExperience(experienceId): void
- updateExperience(experienceId, data): void
- addEducation(education): void
- addSkill(skill): void
- removeSkill(skillId): void
- addProject(project): void
- saveResume(): void
  - POST/PUT /resumes with data
- validateResume(): boolean
- exportResume(format: 'pdf' | 'word'): void

// Usage Example:
const { resumeData, updatePersonalInfo, saveResume } = useResumeData();
```

#### **useTasks.ts**
```typescript
// Task management
// State:
- tasks: Array<Task>
- filteredTasks: Array<Task>
- isLoading: boolean
- error: string | null
- selectedFilter: FilterOptions
- sortBy: string

// Functions:
- fetchTasks(filters): void
  - GET /tasks with optional filters
- createTask(taskData): void
  - POST /tasks
- updateTask(taskId, updates): void
  - PUT /tasks/:id
- deleteTask(taskId): void
  - DELETE /tasks/:id
- markTaskComplete(taskId): void
- setFilter(filter: FilterOptions): void
- setSortBy(sortKey: string): void
- getTasksByStatus(status): Array<Task>
- getTasksByPriority(priority): Array<Task>
- getTasksDueToday(): Array<Task>

// Usage Example:
const { tasks, createTask, markTaskComplete } = useTasks();
```

#### **useMobile.ts**
```typescript
// Responsive design helper
// Returns:
- isMobile: boolean (true if viewport width < 768px)

// Updates on window resize
// Used for conditional rendering

// Usage Example:
const isMobile = useMobile();
return isMobile ? <MobileMenu /> : <DesktopMenu />;
```

### 7. Global State Management

#### **AuthContext** (`lib/auth-context.tsx`)
```typescript
// Global authentication state using React Context API
// Provides:
- user: User object (or null)
- isAuthenticated: boolean
- isLoading: boolean
- error: string | null

// Functions:
- login(email: string, password: string): Promise<void>
  - POST /auth/login
- logout(): void
  - Clear user state
  - Remove JWT from storage
- signup(userData): Promise<void>
  - POST /auth/signup
- refreshToken(): Promise<void>
  - POST /auth/refresh
- updateProfile(data): Promise<void>

// Accessed via:
const { user, isAuthenticated, login, logout } = useContext(AuthContext);

// Why Context instead of Redux:
- Simpler for auth-only state
- No extra dependencies
- Built into React
- Sufficient for this use case
- Less boilerplate
```

**AuthContext Provider in layout.tsx**:
```typescript
// Wraps entire app
// Initializes by:
1. Checking localStorage for JWT
2. Validating token
3. Fetching user profile
4. Setting authenticated state
```

### 8. Styling System

#### **Tailwind CSS**
- Utility-first CSS framework
- Classes like `flex`, `items-center`, `gap-2`
- No CSS files needed for simple styling
- Configuration in `tailwind.config.js`

#### **Global Styles** (`app/globals.css`)
```css
- CSS reset
- Font imports
- Global color variables
- Root styles
```

#### **Dark Mode** (`components/theme-provider.tsx` & `components/ModeToggle.tsx`)
```typescript
// Uses next-themes library
// Features:
- Toggle between light/dark/system modes
- Persists preference to localStorage
- Instant theme switching
- CSS variables for colors

// Usage:
<ModeToggle /> button in sidebar
- Automatically switches all component colors
- Uses data-theme attribute on root element
```

### 9. Type Safety

#### **Type Definitions** (`types/task.ts`)
```typescript
// TypeScript interfaces for data structures
export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'interview' | 'study' | 'resume' | 'discussion' | 'other';
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
```

**Benefits**:
- IDE auto-completion
- Compile-time error checking
- Self-documenting code
- Type safety across app

### 10. Utility Functions

#### **lib/utils.ts**
```typescript
// Helper functions
- cn() - Merge Tailwind classes conditionally
- formatDate()
- formatCurrency()
- etc.
```

#### **utils/dateHelpers.ts**
```typescript
// Date manipulation utilities
- formatDate(date, format)
- isOverdue(dueDate)
- daysUntil(date)
- formatDuration(seconds)
- isToday(date)
- isThisWeek(date)
```

**Usage Example**:
```typescript
import { formatDate, isOverdue } from '@/utils/dateHelpers';

const dueDateDisplay = formatDate(task.dueDate, 'MMM dd, yyyy');
const isLate = isOverdue(task.dueDate);
```

---

## Data Flow Diagrams

### Authentication Flow

```
User Input (Login Page)
       ↓
login-form.tsx (client-side validation)
       ↓
POST /api/auth/login { email, password }
       ↓
Backend: 
  1. Find user by email
  2. Compare password hash with stored hash
  3. If match: generate JWT token
  4. Return { token, user }
       ↓
Response: { token, user }
       ↓
Frontend:
  1. Store JWT in localStorage/cookie
  2. Update AuthContext.user
  3. Update AuthContext.isAuthenticated = true
       ↓
Redirect to /dashboard
       ↓
All subsequent requests include:
  Authorization: Bearer <JWT_TOKEN>
```

### Interview Preparation Flow

```
User Navigation
       ↓
Click "Start Interview" (/dashboard/interview)
       ↓
useInterview.startInterview() called
       ↓
POST /interview { type: 'JavaScript' }
       ↓
Backend:
  1. Create interview session
  2. Randomly select 10 questions
  3. Return interview object with questions
       ↓
Response: { interviewId, questions }
       ↓
Frontend: useInterview state updated
       ↓
Display Question 1 of 10
  - Show question text
  - Show input field (textarea, multiple choice, etc.)
  - Show timer
  - Show question counter
       ↓
User Types/Selects Answer
       ↓
Click "Next Question"
       ↓
POST /interview/{id}/answer { questionId, answer }
       ↓
Backend: Store answer in database
       ↓
Response: { success: true }
       ↓
Frontend: Move to Question 2
       ↓
[Repeat for all 10 questions]
       ↓
Click "Submit Interview"
       ↓
POST /interview/{id}/complete
       ↓
Backend:
  1. Grade all answers
  2. Calculate score
  3. Generate feedback
  4. Update interview status = "completed"
       ↓
Response: { score, feedback, results }
       ↓
Frontend: Display results dashboard
  - Total score
  - Question-by-question feedback
  - Time analysis
  - Category-wise breakdown
  - Option to review answers
  - Option to practice more
```

### Resume Building Flow

```
User Navigation
       ↓
Navigate to /dashboard/resume
       ↓
ResumeBuilder component mounts
       ↓
useResumeData.initializeNewResume() OR loadResume(id)
       ↓
If loading existing resume:
  GET /resumes/{id}
  → Resume data loaded into form state
       ↓
User fills form sections (real-time state updates)
  - Personal Info → updatePersonalInfo()
  - Add Experience → addExperience()
  - Add Education → addEducation()
  - etc.
       ↓
Optional: Preview panel shows formatted resume
       ↓
User clicks "Save Resume"
       ↓
useResumeData.saveResume() called
       ↓
If new resume:
  POST /resumes { resumeData }
If existing resume:
  PUT /resumes/{id} { resumeData }
       ↓
Backend: Validate and store in database
       ↓
Response: { id, success: true, message }
       ↓
Frontend:
  1. Show success message/toast
  2. Update local state with returned data
  3. Clear "dirty" flag
  4. Optional: redirect to ResumeList
       ↓
ResumeList shows updated resume
```

### Task Management Flow

```
User Navigation
       ↓
Navigate to /dashboard/weekly-tasks
       ↓
useTasks.fetchTasks() called on mount
       ↓
GET /tasks?week=current
       ↓
Backend: Query tasks for current week
       ↓
Response: Array<Task>
       ↓
Frontend: Display tasks grouped by status
       ↓
User clicks "New Task"
       ↓
Task creation form opens
       ↓
User fills form: title, description, dueDate, priority, etc.
       ↓
User clicks "Create"
       ↓
POST /tasks { taskData }
       ↓
Backend: Validate and store task
       ↓
Response: { id, success: true }
       ↓
Frontend: Add task to task list
       ↓
User drags task to "In Progress"
       ↓
PUT /tasks/{id} { status: 'in-progress' }
       ↓
Backend: Update task status
       ↓
Frontend: Update UI immediately
       ↓
User clicks "Complete"
       ↓
PUT /tasks/{id} { status: 'completed', completedAt: now }
       ↓
Backend: Update task, mark completed
       ↓
Frontend: Move to completed section, remove from active
```

---

## Technology Stack

### Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime environment |
| **Hono.js** | 4.x+ | Lightweight web framework, routing, middleware |
| **TypeScript** | 4.9+ | Static type checking for JavaScript |
| **PostgreSQL/MongoDB** | Latest | Relational/NoSQL database |
| **Prisma** / **TypeORM** | (inferred) | ORM - database abstraction layer |
| **jsonwebtoken (JWT)** | - | Create and verify authentication tokens |
| **bcrypt** | - | Password hashing and verification |
| **cors** | - | Cross-Origin Resource Sharing middleware |
| **dotenv** | - | Environment variable management |

### Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.x | React framework with SSR, file-based routing, API routes |
| **React** | 18.x | UI library and component framework |
| **TypeScript** | 4.9+ | Static type checking |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **shadcn/ui** | Latest | Headless component library built on Radix UI |
| **next-themes** | - | Dark mode support and theme switching |
| **Radix UI** | - | Accessible component primitives |
| **react-hook-form** | (implied) | Form state management |
| **zod** / **yup** | (implied) | Form validation library |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting and style enforcement |
| **Prettier** | Code formatting (optional) |
| **git** | Version control |
| **npm/yarn** | Package management |

---

## Design Patterns

### 1. **Separation of Concerns (SoC)**
- **Backend**: Business logic, data validation, database operations, authentication
- **Frontend**: UI rendering, user interactions, client-side validation, state management
- **Clear boundary**: REST API

**Benefit**: Each layer can be modified independently

### 2. **Component-Based Architecture**
- Small, single-responsibility components
- Props-based composition
- Reusable across multiple pages
- shadcn/ui provides base components

**Benefit**: Code reuse, easier maintenance, testability

**Example**:
```typescript
<Card>
  <Card.Header>Resume</Card.Header>
  <Card.Content>
    <Button onClick={handleEdit}>Edit</Button>
  </Card.Content>
</Card>
```

### 3. **Protected Routes Pattern**
```typescript
// Routes that require authentication
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Protection checks:
// 1. Is user authenticated?
// 2. Is JWT valid and not expired?
// 3. Redirect to /login if not
```

**Benefit**: Security, prevents unauthorized access

### 4. **Custom Hooks for Logic Encapsulation**
```typescript
// Instead of component-level logic:
const useInterview = () => {
  // All interview logic here
  return { interview, submitAnswer, ... };
};

// Use in any component:
const { interview } = useInterview();
```

**Benefit**: 
- Logic reuse across components
- Easier testing
- Cleaner components
- Easy to debug

### 5. **Context API for Global State**
```typescript
<AuthContextProvider>
  <App />
</AuthContextProvider>

// Access anywhere:
const { user, isAuthenticated } = useContext(AuthContext);
```

**Benefit**: Avoid prop drilling, global state access

### 6. **API-Driven Architecture**
- Frontend communicates ONLY through REST API
- No direct database access from frontend
- All business logic on backend
- Frontend validates for UX, backend validates for security

**Example**:
```typescript
// Frontend
const submitAnswer = async (answer) => {
  const response = await fetch('/api/interview/123/answer', {
    method: 'POST',
    body: JSON.stringify({ answer })
  });
  return response.json();
};
```

### 7. **Modular Routing (Backend)**
```
routes/
  ├── auth.ts        // All auth endpoints
  ├── interview.ts   // All interview endpoints
  ├── questions.ts   // All question endpoints
  └── ...
```

**Benefit**: 
- Feature-based organization
- Easy to add/remove features
- Clear file structure

### 8. **Token-Based Authentication (JWT)**
- No server-side session storage
- Stateless authentication
- Token sent in every request header
- Backend verifies signature
- Self-contained user claims

**Flow**:
```
1. Login → Server generates JWT
2. Store JWT on client
3. Every request → Include JWT in header
4. Server → Verify JWT signature
5. Extract user info from JWT
```

### 9. **Type-First Development (TypeScript)**
- Define types before implementation
- Interfaces for API responses
- Strict null checking
- Compile-time error detection

**Benefit**: Fewer runtime errors, better IDE support, self-documenting code

### 10. **Dependency Injection (Implicit)**
- Services passed via props or context
- Easier testing and mocking
- Loose coupling

---

## Potential Advancement Areas

### 🚀 **Quick Wins (1-2 weeks)**

#### 1. **Automated Notifications**
- Email reminders for upcoming tasks
- Interview completion emails with results
- Task deadline warnings

**Technology**: Nodemailer, SendGrid, or similar

**Implementation**:
```
Backend:
- Add email service module
- Queue system (Bull, Agenda)
- Send emails on triggers (task due, interview complete)

Frontend:
- Email preference settings
- Notification center UI
```

#### 2. **Resume PDF Export**
- Generate downloadable PDF resumes
- Template styles
- Download on resume view

**Technology**: pdfkit, puppeteer, or jsPDF

**Implementation**:
```
Backend:
- PDF generation service
- HTML to PDF conversion
- Template styling

Frontend:
- Download button on resume list
- PDF preview modal
```

#### 3. **Question Bookmarking/Favorites**
- Save frequently asked questions
- Create collections/folders
- Quick access from dashboard

**Backend**:
- Add bookmarks table/collection
- Endpoints to add/remove/get bookmarks

**Frontend**:
- Bookmark button on each question
- Bookmarks page in dashboard

#### 4. **Interview Analytics Dashboard**
- Performance charts
- Time analysis
- Category-wise breakdown
- Improvement tracking

**Technology**: Chart.js, Recharts, or similar

**Implementation**:
```
Frontend:
- Analytics page in dashboard
- Line chart: score progression
- Bar chart: category performance
- Time spent by category
- Success rate metrics
```

#### 5. **Search & Filter Enhancement**
- Full-text search in questions
- Advanced filters
- Saved search queries
- Search history

**Backend**:
- Search indexing (Elasticsearch, or database full-text search)
- Filter query builder

**Frontend**:
- Advanced search UI
- Filter badges/chips
- Clear filters button

---

### 🎯 **Medium Enhancements (2-4 weeks)**

#### 1. **Real-Time Collaboration**
- WebSocket integration
- Live group discussions
- Collaborative resume editing
- Peer code reviews

**Technology**: Socket.io, WebSockets

**Implementation**:
```
Backend:
- WebSocket server setup
- Real-time message broadcasting
- Presence tracking

Frontend:
- Real-time connection management
- Live updates without page refresh
- User presence indicators
```

#### 2. **AI-Powered Features**
- Interview feedback using OpenAI/Claude
- Resume improvement suggestions
- Question recommendations based on weaknesses
- Study path generation

**Technology**: OpenAI API, Anthropic Claude, Cohere

**Implementation**:
```
Backend:
- LLM integration service
- Prompt engineering
- Response caching

Frontend:
- AI suggestion UI
- Loading states for LLM requests
- Suggestion acceptance/rejection
```

#### 3. **Gamification System**
- Points for completing tasks/interviews
- Badges for achievements
- Leaderboards
- Streak tracking

**Data Model**:
```typescript
User {
  points: number,
  badges: Array<Badge>,
  streaks: {
    currentStreak: number,
    longestStreak: number,
    lastActivityDate: Date
  }
}

Badge {
  id: string,
  name: string,
  description: string,
  icon: string,
  criteria: string (e.g., "5 interviews completed")
}
```

**Implementation**:
```
Backend:
- Point calculation on actions
- Badge awarding logic
- Leaderboard queries

Frontend:
- Leaderboard page
- Achievement notifications
- Streak display in sidebar
```

#### 4. **Progress & Learning Paths**
- Personalized learning paths based on goals
- Skill assessment quizzes
- Recommended next steps
- Progress milestones

**Implementation**:
```
Backend:
- Learning path templates
- Skill assessment algorithm
- Recommendation engine

Frontend:
- Learning path wizard
- Progress timeline
- Skill tree visualization
```

#### 5. **Resume Versioning & Comparison**
- Track resume changes
- Version history
- Compare two versions
- Rollback to previous version

**Data Model**:
```typescript
ResumeVersion {
  id: string,
  resumeId: string,
  versionNumber: number,
  data: ResumeData,
  changesSummary: string,
  createdAt: Date,
  createdBy: string
}
```

---

### 🔮 **Advanced Features (1+ months)**

#### 1. **Mobile App**
- React Native or Flutter app
- Offline question practice
- Push notifications
- Mobile-optimized interview interface

**Technology**: React Native, Flutter, or Expo

#### 2. **Video Interview Recording**
- Record mock interviews
- Playback and self-evaluation
- AI analysis of speech patterns
- Transcript generation

**Technology**: WebRTC, Ffmpeg, OpenAI Whisper

**Implementation**:
```
Backend:
- Video storage (AWS S3, Google Cloud)
- Video processing pipeline
- Transcript generation service

Frontend:
- WebRTC recorder component
- Video preview
- Self-evaluation form
```

#### 3. **Job Market Integration**
- Job posting feeds (LinkedIn, Glassdoor API)
- Company-specific interview prep
- Salary insights and negotiation guides
- Application tracking

**Technology**: Job API integrations, web scraping

#### 4. **Peer Mentorship**
- Mentee/mentor matching algorithm
- In-app messaging
- Mentorship scheduling
- Rating system

**Implementation**:
```
Backend:
- Mentor profile/availability management
- Matching algorithm
- Booking calendar system
- Rating/review system

Frontend:
- Mentor discovery page
- Booking UI
- Messaging interface
- Review submission
```

#### 5. **Advanced Analytics & Recommendations**
- Machine learning for personalized question recommendations
- Spaced repetition algorithms
- Adaptive difficulty
- Performance prediction

**Technology**: TensorFlow.js, scikit-learn, or custom algorithms

---

### 🌟 **Community & Social (Ongoing)**

#### 1. **Group Discussions Enhancement**
- Code snippet sharing in discussions
- Syntax highlighting
- Discussion voting/rating
- Moderation tools

#### 2. **User Profiles & Portfolios**
- Public profile pages
- Portfolio showcase
- Achievement badges visible to others
- Social following

#### 3. **Content Contributions**
- Community-submitted questions
- Discussion moderators
- Curated content series
- Guest blog posts

#### 4. **Referral Program**
- Invite friends
- Reward points/premium access
- Referral tracking
- Leaderboard

---

### 🏗️ **Infrastructure & DevOps**

#### 1. **Deployment Pipeline**
- CI/CD with GitHub Actions
- Automated testing
- Staging environment
- Production deployment

#### 2. **Monitoring & Observability**
- Error tracking (Sentry)
- Performance monitoring (New Relic, DataDog)
- User analytics (Mixpanel, Amplitude)
- Logging infrastructure

#### 3. **Database Optimization**
- Query optimization
- Indexing strategy
- Caching layer (Redis)
- Database replication/backup

#### 4. **Scalability**
- Load balancing
- Horizontal scaling
- CDN for static assets
- Database connection pooling

---

## Recommended Next Steps

### **Phase 1: Core Enhancements (Weeks 1-2)**
1. ✅ Resume PDF export
2. ✅ Question bookmarking
3. ✅ Interview analytics dashboard
4. ✅ Email notifications

### **Phase 2: User Experience (Weeks 3-6)**
1. ✅ AI-powered interview feedback
2. ✅ Gamification basics (points, badges)
3. ✅ Real-time discussions (WebSocket)
4. ✅ Progress tracking improvements

### **Phase 3: Advanced Features (Months 2-3)**
1. ✅ Video interview recording
2. ✅ Mobile app MVP
3. ✅ Job market integration
4. ✅ Mentorship system

### **Phase 4: Scale & Optimize (Ongoing)**
1. ✅ Performance optimization
2. ✅ DevOps & CI/CD
3. ✅ Analytics & monitoring
4. ✅ Community features

---

## Notes for Future Reference

- **Backend Framework**: Hono.js (lightweight, edge-ready web framework)
- **Database**: Likely PostgreSQL or MongoDB (inferred from structure)
- **API Design**: RESTful API with JSON requests/responses
- **Authentication**: JWT-based with possible refresh tokens
- **Code Style**: TypeScript strict mode enabled
- **UI Framework**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API for auth, custom hooks for features
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

---

## Data Sourcing Strategy for Company-Specific Content

Based on analysis of PrepInsta's structure (Companies, Aptitude, Interview, CS Subjects, Programming modules), here's a comprehensive guide to implement similar content at scale.

### 1. Data Sources

#### **Open/Free Datasets**

| Source | Content Type | Data Format | Link |
|--------|-------------|-------------|------|
| **LeetCode API** | Coding problems, difficulty, companies | JSON | https://github.com/Ma124/LeetCode-Scraper |
| **GitHub** | Interview questions repos | Markdown/JSON | Search: "interview-questions", "dsa-problems" |
| **HackerRank** | Coding problems, tutorials | API (limited free tier) | https://www.hackerrank.com/api |
| **CodeSignal** | Coding interview problems | Scraped data available | https://codesignal.com |
| **GeeksforGeeks** | DSA, SQL, OS, DBMS content | Web scraping | https://www.geeksforgeeks.org |
| **InterviewBit** | Interview questions, curated by company | Scraped datasets on GitHub | https://www.interviewbit.com |
| **Glassdoor Data** | Interview experiences | Limited API (requires scraping) | https://www.glassdoor.com |
| **LeetCode Discussions** | Real interview experiences | Community data | Scrape from threads |
| **GitHub Repos** | Community-curated interview content | JSON/Markdown | "awesome-interview-questions" |
| **Kaggle Datasets** | Pre-compiled interview data | CSV/JSON | Search: "company interview questions" |

#### **Paid/Licensed Data**

| Source | Data Type | Cost | Notes |
|--------|-----------|------|-------|
| **Bright Data** | Web scraping as a service | $$$$ | Legal, scalable scraping |
| **ScraperAPI** | Scraping with proxy rotation | $$$ | Easy integration |
| **StockInterview** | Real interview experiences | Paid API | Company-specific content |
| **AltexSoft** | Tech content, benchmarks | Enterprise licensing | High quality |

---

### 2. Data Collection Methods

#### **Method 1: Web Scraping (For Free Datasets)**

**Tools**:
- **Cheerio** (Node.js) - Fast, lightweight HTML parsing
- **Puppeteer** (Node.js) - Headless browser for JS-heavy sites
- **Scrapy** (Python) - Full-featured scraping framework
- **BeautifulSoup** (Python) - Simple HTML/XML parsing

**Example: Scraping LeetCode Problems**

```typescript
// backend/src/services/dataCollection/leetcodeScaper.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
  topics: string[];
  url: string;
  acceptance: number;
}

export async function scrapeLeetCodeProblems(
  tags?: string[],
  difficulty?: string
): Promise<Problem[]> {
  const problems: Problem[] = [];
  
  try {
    // LeetCode GraphQL API approach (better than scraping HTML)
    const response = await axios.post('https://leetcode.com/graphql', {
      query: `{
        allQuestionsCount {
          difficulty
          count
        }
        questionList(
          first: 50,
          filters: {
            difficulty: "${difficulty || 'ALL'}",
            tags: ${JSON.stringify(tags || [])}
          }
        ) {
          total
          edges {
            node {
              questionId
              title
              difficulty
              topicTags { name }
              companyTagStats { ... on CompanyTag { name } }
              acRate
              frontendId
              slug
            }
          }
        }
      }`
    });

    const data = response.data.data.questionList.edges;
    
    return data.map((edge: any) => ({
      id: edge.node.questionId,
      title: edge.node.title,
      difficulty: edge.node.difficulty,
      companies: edge.node.companyTagStats.map((tag: any) => tag.name),
      topics: edge.node.topicTags.map((tag: any) => tag.name),
      url: `https://leetcode.com/problems/${edge.node.slug}/`,
      acceptance: edge.node.acRate
    }));
  } catch (error) {
    console.error('Error scraping LeetCode:', error);
    return problems;
  }
}
```

**Challenges**:
- Rate limiting (add delays between requests)
- Dynamic content loading (use Puppeteer)
- Terms of Service violations (check before scraping)
- IP blocking (use proxy rotation)
- Data freshness (schedule daily/weekly updates)

---

#### **Method 2: API Integration**

**Approach**: Use official/unofficial APIs where available

```typescript
// backend/src/services/dataCollection/apiIntegration.ts

// LeetCode Unofficial API
export async function fetchLeetCodeAPI(queryString: string) {
  const response = await fetch('https://leetcode.com/api/problems/all/', {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  });
  return response.json();
}

// HackerRank API (requires auth token)
export async function fetchHackerRankProblems(token: string) {
  const response = await fetch('https://www.hackerrank.com/rest/contests/master/challenges', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
}

// GitHub API - search interview question repos
export async function searchGitHubInterviewRepos() {
  const response = await fetch(
    'https://api.github.com/search/repositories?q=interview+questions&sort=stars&order=desc',
    {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
      }
    }
  );
  return response.json();
}
```

---

#### **Method 3: Community Contributions**

**User-Submitted Content Model**:

```typescript
// types/communityContent.ts
export interface CommunityQuestion {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  company: string;
  submittedBy: string;
  interviewExperience?: string;
  solution?: string;
  approved: boolean;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewExperience {
  id: string;
  company: string;
  position: string;
  rounds: Array<{
    number: number;
    type: string;
    description: string;
    duration: number;
    questionsAsked: string[];
  }>;
  result: 'Pass' | 'Fail';
  submittedBy: string;
  verified: boolean;
  helpful: number;
  createdAt: Date;
}
```

**Backend Endpoints for Community**:

```typescript
// routes/community.ts
export const communityRoutes = new Hono()
  .post('/questions', async (c) => {
    // Validate and store community question
    // Moderate before approval
    const question = await c.req.json();
    // ... validation, moderation, storage
  })
  .post('/experiences', async (c) => {
    // Store interview experience
    const experience = await c.req.json();
    // ... validation, storage
  })
  .get('/questions/company/:company', async (c) => {
    // Get all questions for specific company
  })
  .put('/questions/:id/verify', async (c) => {
    // Admin: verify community submission
  });
```

---

### 3. Database Schema for Company-Specific Content

```typescript
// Database schema for organizing content by company

// Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  logo_url VARCHAR(255),
  description TEXT,
  industry VARCHAR(100),
  headquarters VARCHAR(255),
  rating DECIMAL(3,1),
  totalQuestions INT DEFAULT 0,
  active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW()
);

// Company Specific Questions
CREATE TABLE company_questions (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- "Coding", "DSA", "System Design", "Behavioral"
  difficulty VARCHAR(20),
  topic VARCHAR(100),
  solution TEXT,
  explanation TEXT,
  company_frequency INT DEFAULT 0, -- How many times this question was asked
  last_asked DATE,
  frequency_trend VARCHAR(20), -- "Increasing", "Decreasing", "Stable"
  success_rate DECIMAL(3,1), -- % of users who solved it
  acceptance_count INT DEFAULT 0,
  views INT DEFAULT 0,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);

// Interview Experiences
CREATE TABLE interview_experiences (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  position VARCHAR(255),
  experience_level VARCHAR(50),
  location VARCHAR(255),
  interview_date DATE,
  total_rounds INT,
  result VARCHAR(20),
  salary_offered DECIMAL(15,2),
  experience_report TEXT,
  submitted_by UUID,
  verified BOOLEAN DEFAULT false,
  helpful_count INT DEFAULT 0,
  createdAt TIMESTAMP
);

// Interview Rounds Details
CREATE TABLE interview_rounds (
  id UUID PRIMARY KEY,
  experience_id UUID REFERENCES interview_experiences(id),
  round_number INT,
  round_type VARCHAR(50), -- "Phone Screen", "Technical", "System Design", "HR", "Behavioral"
  duration_minutes INT,
  description TEXT,
  questions_asked TEXT[], -- Array of question IDs
  feedback TEXT,
  passed BOOLEAN
);

// CS Subjects/Syllabus
CREATE TABLE cs_syllabus (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  subject VARCHAR(100), -- "DSA", "OS", "DBMS", "OOP", "System Design"
  topics JSONB, -- Hierarchical topics
  resources JSONB, -- Links to learning materials
  avg_importance DECIMAL(3,1),
  created_at TIMESTAMP
);

// Preparation Tracks
CREATE TABLE preparation_tracks (
  id UUID PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  name VARCHAR(255), -- "3-Month Google Prep", "Amazon Interview Guide"
  description TEXT,
  difficulty_level VARCHAR(20),
  duration_weeks INT,
  syllabus JSONB,
  questions_count INT,
  estimated_hours INT,
  success_rate DECIMAL(3,1)
);

// Indexes for performance
CREATE INDEX idx_company_name ON companies(name);
CREATE INDEX idx_company_questions_difficulty ON company_questions(difficulty);
CREATE INDEX idx_company_questions_category ON company_questions(category);
CREATE INDEX idx_experiences_company ON interview_experiences(company_id);
CREATE INDEX idx_experiences_result ON interview_experiences(result);
```

---

### 4. Data Aggregation Strategy

#### **Architecture**:

```
┌─────────────────────────────────────┐
│        Data Collection Layer        │
├─────────────────────────────────────┤
│ • LeetCode Scraper                  │
│ • GitHub Dataset Loader             │
│ • GeeksforGeeks Crawler             │
│ • Glassdoor Experience Crawler      │
│ • Community Submissions             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     Data Processing & Enrichment    │
├─────────────────────────────────────┤
│ • Deduplication                     │
│ • Company Mapping                   │
│ • Difficulty Standardization        │
│ • Topic Tagging                     │
│ • Frequency Analysis                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Database Storage               │
├─────────────────────────────────────┤
│ • PostgreSQL with optimized schema  │
│ • Redis cache for frequent queries  │
│ • Elasticsearch for full-text search│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      API Layer (Hono)               │
├─────────────────────────────────────┤
│ • /companies/:id/questions          │
│ • /companies/:id/experiences        │
│ • /companies/:id/syllabus           │
│ • /companies/:id/tracks             │
└─────────────────────────────────────┘
```

#### **Backend Implementation**:

```typescript
// backend/src/services/dataAggregation.ts
import * as schedule from 'node-schedule';

export class DataAggregationService {
  // Run daily at 2 AM
  static async initializeScheduledJobs() {
    schedule.scheduleJob('0 2 * * *', async () => {
      await this.aggregateAllData();
    });
  }

  static async aggregateAllData() {
    console.log('Starting data aggregation...');
    
    try {
      // 1. Fetch from multiple sources
      const leetcodeData = await this.fetchLeetCodeData();
      const hackerRankData = await this.fetchHackerRankData();
      const geeksData = await this.fetchGeeksforGeeksData();
      const communityData = await this.getCommunityQuestions();

      // 2. Deduplicate
      const deduplicatedData = await this.deduplicateQuestions([
        ...leetcodeData,
        ...hackerRankData,
        ...geeksData
      ]);

      // 3. Enrich with company information
      const enriched = await this.enrichWithCompanyData(deduplicatedData);

      // 4. Standardize difficulty/topics
      const standardized = await this.standardizeData(enriched);

      // 5. Store in database
      await this.storeInDatabase([
        ...standardized,
        ...communityData
      ]);

      // 6. Update analytics
      await this.updateAnalytics();

      console.log('Data aggregation completed successfully');
    } catch (error) {
      console.error('Data aggregation failed:', error);
      // Send alert notification
    }
  }

  static async deduplicateQuestions(questions: any[]) {
    const seen = new Set<string>();
    const duplicates = new Map<string, any[]>();

    questions.forEach(q => {
      // Create hash from title + company
      const hash = `${q.title.toLowerCase()}_${q.company}`;
      if (seen.has(hash)) {
        if (!duplicates.has(hash)) {
          duplicates.set(hash, [q]);
        }
        duplicates.get(hash)!.push(q);
      }
      seen.add(hash);
    });

    // Merge duplicates, keeping most recent and enriched version
    const merged = Array.from(duplicates.values()).map(group => {
      return group.reduce((best, current) => {
        return (current.solution && !best.solution) ? current : best;
      });
    });

    return merged;
  }

  static async enrichWithCompanyData(questions: any[]) {
    // Map company names to IDs, add company metadata
    return questions.map(q => ({
      ...q,
      company_id: await this.getCompanyId(q.company),
      frequency_trend: await this.calculateFrequencyTrend(q),
      last_asked: await this.findLastAskedDate(q)
    }));
  }

  static async standardizeData(questions: any[]) {
    return questions.map(q => ({
      ...q,
      difficulty: this.normalizeDifficulty(q.difficulty),
      category: this.normalizeCategory(q.category),
      topics: this.standardizeTopics(q.topics)
    }));
  }

  private static normalizeDifficulty(difficulty: string): string {
    const map: Record<string, string> = {
      'EASY': 'Easy',
      'easy': 'Easy',
      'E': 'Easy',
      'MEDIUM': 'Medium',
      'medium': 'Medium',
      'M': 'Medium',
      'HARD': 'Hard',
      'hard': 'Hard',
      'H': 'Hard'
    };
    return map[difficulty] || difficulty;
  }

  private static normalizeCategory(category: string): string {
    const map: Record<string, string> = {
      'ARRAY': 'Arrays & Strings',
      'TREE': 'Trees & Graphs',
      'DP': 'Dynamic Programming',
      'GREEDY': 'Greedy Algorithms',
      'SYSTEM_DESIGN': 'System Design'
    };
    return map[category] || category;
  }
}
```

---

### 5. Frontend Implementation

#### **Company Selection Page**:

```typescript
// app/dashboard/company-prep/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Button } from '@/components/ui';

interface Company {
  id: string;
  name: string;
  logo: string;
  questionCount: number;
  experienceCount: number;
  rating: number;
  difficulty: string;
}

export default function CompanyPrepPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Fetch companies
    fetch('/api/companies')
      .then(r => r.json())
      .then(data => setCompanies(data));
  }, []);

  const handleSelectCompany = (companyId: string) => {
    router.push(`/dashboard/company-prep/${companyId}`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Company-Specific Preparation</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {companies.map(company => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <img 
                src={company.logo} 
                alt={company.name}
                className="h-12 w-12 mb-4"
              />
              <h3 className="text-xl font-bold mb-2">{company.name}</h3>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {company.questionCount} questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {company.experienceCount} interview experiences
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Rating: {company.rating}/5
                  </Badge>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSelectCompany(company.id)}
                className="w-full"
              >
                Start Preparation
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### **Company-Specific Dashboard**:

```typescript
// app/dashboard/company-prep/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Tabs, Card, Button, Badge } from '@/components/ui';

export default function CompanyDashboard({ params }: { params: { id: string } }) {
  const [company, setCompany] = useState<any>(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    fetch(`/api/companies/${params.id}`)
      .then(r => r.json())
      .then(data => setCompany(data));
  }, [params.id]);

  if (!company) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <img src={company.logo} alt={company.name} className="h-16 w-16" />
        <div>
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <p className="text-gray-600">{company.description}</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="experiences">Interview Experiences</TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
          <TabsTrigger value="track">Prep Track</TabsTrigger>
        </TabsList>

        {tab === 'overview' && <CompanyOverview company={company} />}
        {tab === 'questions' && <CompanyQuestions companyId={params.id} />}
        {tab === 'experiences' && <InterviewExperiences companyId={params.id} />}
        {tab === 'syllabus' && <CompanySyllabus companyId={params.id} />}
        {tab === 'track' && <PrepTrack companyId={params.id} />}
      </Tabs>
    </div>
  );
}
```

---

### 6. Recommended Implementation Timeline

#### **Phase 1 (Weeks 1-2): Foundation**
- [ ] Design database schema
- [ ] Set up data collection scripts for 2-3 sources (LeetCode, GitHub)
- [ ] Create company master data
- [ ] Build basic company listing page

#### **Phase 2 (Weeks 3-4): Aggregation**
- [ ] Implement data deduplication
- [ ] Add company mapping and enrichment
- [ ] Create scheduled data sync jobs
- [ ] Build company-specific question pages

#### **Phase 3 (Weeks 5-6): Enhancement**
- [ ] Add interview experience collection
- [ ] Implement syllabus/curriculum mapping
- [ ] Create prep tracks/learning paths
- [ ] Add analytics and insights

#### **Phase 4 (Week 7+): Community**
- [ ] Enable user submissions of questions/experiences
- [ ] Add moderation workflow
- [ ] Implement verification system
- [ ] Create contribution rewards

---

### 7. Legal & Ethical Considerations

⚠️ **Before scraping, consider:**

1. **Check Terms of Service**
   - LeetCode, HackerRank, GeeksforGeeks prohibit scraping
   - But community-sourced content is generally OK
   - Always include attribution

2. **Use robots.txt**
   - Respect website crawl directives
   - Add delays between requests
   - Identify your crawler with User-Agent

3. **Data Attribution**
   - Always credit original sources
   - Link back to original content
   - Mention when data is aggregated

4. **Copyright Compliance**
   - Original question text: reference only, not full copy
   - Solutions: summarize and add your explanations
   - Create original educational content

5. **GDPR/Privacy**
   - Anonymize interview experiences
   - Get consent before publishing user data
   - Allow users to delete their submissions

**Recommended Approach: Community-First**
- Focus on user-submitted content
- Curate high-quality community questions
- License under Creative Commons
- Build with attribution and transparency

---

### 8. Alternative: Licensed Data

If scraping concerns exist, consider:

**LeetCode Premium API** ($) - Explore if they offer data licensing
**InterviewBit Partnerships** - Potential content licensing
**Udemy/Coursera** - Licensed course content
**Company Partnerships** - Ask companies directly for common questions

---

**Document Updated**: January 29, 2026
**Last Updated**: January 29, 2026
**Project Status**: Active Development with expansion potential
