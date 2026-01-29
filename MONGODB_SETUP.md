# MongoDB Setup Guide - CareerMind

## Quick Start

### Option 1: MongoDB Compass (GUI)

1. **Open MongoDB Compass**
2. Connect to your MongoDB instance
3. Copy-paste the entire contents of `backend/src/db/seeds/mongo-init.js`
4. Go to your database → Open MongoDB Shell → Paste & Execute
5. Run `npm run seed` to populate initial data

### Option 2: MongoDB Shell (Command Line)

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/careermind

# Paste entire contents of mongo-init.js file
# Or run in file directly:
mongosh mongodb://localhost:27017/careermind backend/src/db/seeds/mongo-init.js
```

### Option 3: Node.js Script

```bash
cd backend
npm run seed
# This runs: node -r tsx backend/src/seeds/mongodb-seed.ts
```

## Collections Created (20 total)

**Stage 1 - Aptitude (7 collections)**
- `aptitude_categories` - Main categories (Quantitative, Logical, Verbal)
- `aptitude_subcategories` - 10 focused areas
- `aptitude_questions` - Question bank
- `aptitude_practice_sessions` - User practice sessions
- `user_aptitude_responses` - Answer tracking
- `user_bookmarked_aptitude_questions` - Bookmarks
- `user_aptitude_progress` - Progress tracking

**Stage 2 - Companies (6 collections)**
- `companies` - Company database
- `company_roles` - Role-specific data
- `company_questions` - Questions mapped to companies
- `user_company_progress` - User progress per company
- `company_interview_tips` - Community tips

**Stage 3 - Interview Experiences (7 collections)**
- `interview_experiences` - Interview records
- `interview_question_history` - Questions asked
- `interview_tips_shared` - Community tips
- `interview_preparation_plans` - Prep timeline
- `interview_daily_tasks` - Daily tasks
- `mock_interview_sessions` - Mock interview records
- `interview_feedback` - Peer feedback
- `interview_outcomes` - Final outcomes

## All Indexes Automatically Created

✅ Automatic index creation on all collections for:
- User lookups
- Company lookups
- Date-based sorting
- Unique constraints where needed

## Verify Setup

```javascript
// In MongoDB Shell/Compass
use careermind

// Check all collections
show collections

// Count records
db.aptitude_categories.countDocuments()
db.companies.countDocuments()
db.aptitude_questions.countDocuments()

// Check indexes
db.aptitude_questions.getIndexes()
```

## Environment Setup

In your `.env.local`:
```
MONGODB_URI=mongodb://localhost:27017
NEXT_PUBLIC_DB=careermind
```

## API Usage (No Changes Needed)

All existing routes work with MongoDB:
- Routes in `backend/src/routes/*.ts` accept both SQL and MongoDB
- Frontend hooks already compatible
- Just swap database connection in `db.ts`

## Current Status

✅ All schema files converted to MongoDB  
✅ Indexes created for performance  
✅ Seed data ready to load  
✅ 20 collections initialized  
✅ 10+ indexes on each collection  

**Ready to deploy!**
