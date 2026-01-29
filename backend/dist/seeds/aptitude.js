// backend/src/seeds/aptitude.ts
import { db } from '../db';
export async function seedAptitudeData() {
    try {
        console.log('Seeding aptitude data...');
        // ==================== CATEGORIES ====================
        const categories = [
            {
                id: 'cat-1',
                name: 'Quantitative Aptitude',
                description: 'Numerical reasoning and mathematical problem-solving',
                icon: '📊'
            },
            {
                id: 'cat-2',
                name: 'Logical Reasoning',
                description: 'Pattern recognition, puzzles, and logic problems',
                icon: '🧩'
            },
            {
                id: 'cat-3',
                name: 'Verbal Ability',
                description: 'Reading comprehension, vocabulary, and grammar',
                icon: '📖'
            }
        ];
        for (const cat of categories) {
            await db.query(`
        INSERT INTO aptitude_categories (id, name, description, icon, order_index)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [cat.id, cat.name, cat.description, cat.icon, categories.indexOf(cat)]);
        }
        console.log('✓ Categories seeded');
        // ==================== SUBCATEGORIES ====================
        const subcategories = [
            // Quantitative
            { id: 'subcat-1', catId: 'cat-1', name: 'Numbers', icon: '🔢', order: 1 },
            { id: 'subcat-2', catId: 'cat-1', name: 'Percentages & Ratios', icon: '%', order: 2 },
            { id: 'subcat-3', catId: 'cat-1', name: 'Profit & Loss', icon: '💰', order: 3 },
            { id: 'subcat-4', catId: 'cat-1', name: 'Time & Work', icon: '⏱️', order: 4 },
            { id: 'subcat-5', catId: 'cat-1', name: 'Algebra', icon: 'x', order: 5 },
            // Logical
            { id: 'subcat-6', catId: 'cat-2', name: 'Puzzles', icon: '🧩', order: 1 },
            { id: 'subcat-7', catId: 'cat-2', name: 'Seating Arrangement', icon: '🪑', order: 2 },
            { id: 'subcat-8', catId: 'cat-2', name: 'Coding-Decoding', icon: '🔐', order: 3 },
            // Verbal
            { id: 'subcat-9', catId: 'cat-3', name: 'Reading Comprehension', icon: '📚', order: 1 },
            { id: 'subcat-10', catId: 'cat-3', name: 'Vocabulary', icon: '📝', order: 2 }
        ];
        for (const subcat of subcategories) {
            await db.query(`
        INSERT INTO aptitude_subcategories (id, category_id, name, icon, order_index)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [subcat.id, subcat.catId, subcat.name, subcat.icon, subcat.order]);
        }
        console.log('✓ Subcategories seeded');
        // ==================== QUESTIONS ====================
        const questions = [
            // Numbers - Easy
            {
                id: 'q-1',
                catId: 'cat-1',
                subcatId: 'subcat-1',
                title: 'Prime Number Identification',
                text: 'Which of the following is a prime number?',
                type: 'multiple-choice',
                difficulty: 'Easy',
                explanation: 'A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.',
                steps: [
                    'Check if 17 is divisible by any number between 2 and √17',
                    'Since 17 is only divisible by 1 and 17, it is prime',
                    'Answer: 17'
                ],
                concepts: ['Prime Numbers', 'Divisibility']
            },
            // Numbers - Medium
            {
                id: 'q-2',
                catId: 'cat-1',
                subcatId: 'subcat-1',
                title: 'HCF and LCM',
                text: 'Find the HCF (Highest Common Factor) and LCM (Least Common Multiple) of 12 and 18.',
                type: 'multiple-choice',
                difficulty: 'Medium',
                explanation: 'HCF is the greatest number that divides both numbers. LCM is the smallest number divisible by both.',
                steps: [
                    'Factors of 12: 1, 2, 3, 4, 6, 12',
                    'Factors of 18: 1, 2, 3, 6, 9, 18',
                    'HCF = 6',
                    'LCM = 36'
                ],
                concepts: ['HCF', 'LCM']
            },
            // Percentages - Easy
            {
                id: 'q-3',
                catId: 'cat-1',
                subcatId: 'subcat-2',
                title: 'Simple Percentage Calculation',
                text: 'What is 25% of 200?',
                type: 'multiple-choice',
                difficulty: 'Easy',
                explanation: '25% means 25 out of 100, so multiply by 25/100 or 0.25',
                steps: [
                    '25% of 200 = (25/100) × 200',
                    '= 0.25 × 200',
                    '= 50'
                ],
                concepts: ['Percentages', 'Basic Arithmetic']
            },
            // Puzzles - Easy
            {
                id: 'q-4',
                catId: 'cat-2',
                subcatId: 'subcat-6',
                title: 'Classic Logic Puzzle',
                text: 'If all roses are flowers, and some flowers fade quickly, can we conclude that some roses fade quickly?',
                type: 'multiple-choice',
                difficulty: 'Easy',
                explanation: 'This is a logical deduction problem. Just because some flowers fade and roses are flowers does not mean some roses fade.',
                steps: [
                    'All roses are flowers (given)',
                    'Some flowers fade quickly (given)',
                    'We cannot definitively conclude that roses fade',
                    'Answer: No, we cannot conclude'
                ],
                concepts: ['Logic', 'Deduction']
            },
            // Reading Comprehension - Easy
            {
                id: 'q-5',
                catId: 'cat-3',
                subcatId: 'subcat-9',
                title: 'Comprehension - Main Idea',
                text: 'Passage: "The sun is the primary source of energy for Earth. Its gravitational force keeps our planet in orbit, while its radiation provides heat and light for life. Without the sun, life as we know it would not exist."\n\nWhat is the main idea of this passage?',
                type: 'multiple-choice',
                difficulty: 'Easy',
                explanation: 'The passage emphasizes the importance of the sun for Earth and life.',
                steps: [
                    'Read the entire passage',
                    'Identify the key points: sun provides energy, gravity, heat, light, essential for life',
                    'Main idea: The sun is essential for life on Earth'
                ],
                concepts: ['Reading Comprehension', 'Main Idea']
            }
        ];
        for (const q of questions) {
            await db.query(`
        INSERT INTO aptitude_questions (
          id, category_id, subcategory_id, title, question_text,
          question_type, difficulty, explanation, solution_steps,
          related_concepts
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
      `, [
                q.id,
                q.catId,
                q.subcatId,
                q.title,
                q.text,
                q.type,
                q.difficulty,
                q.explanation,
                JSON.stringify(q.steps),
                JSON.stringify(q.concepts)
            ]);
        }
        console.log('✓ Questions seeded');
        // ==================== OPTIONS ====================
        const options = [
            // Q1 - Prime number
            { id: 'opt-1', qId: 'q-1', text: '15', label: 'A', correct: false },
            { id: 'opt-2', qId: 'q-1', text: '17', label: 'B', correct: true },
            { id: 'opt-3', qId: 'q-1', text: '21', label: 'C', correct: false },
            { id: 'opt-4', qId: 'q-1', text: '25', label: 'D', correct: false },
            // Q2 - HCF LCM
            { id: 'opt-5', qId: 'q-2', text: 'HCF=3, LCM=36', label: 'A', correct: false },
            { id: 'opt-6', qId: 'q-2', text: 'HCF=6, LCM=36', label: 'B', correct: true },
            { id: 'opt-7', qId: 'q-2', text: 'HCF=12, LCM=18', label: 'C', correct: false },
            { id: 'opt-8', qId: 'q-2', text: 'HCF=1, LCM=216', label: 'D', correct: false },
            // Q3 - Percentage
            { id: 'opt-9', qId: 'q-3', text: '25', label: 'A', correct: false },
            { id: 'opt-10', qId: 'q-3', text: '50', label: 'B', correct: true },
            { id: 'opt-11', qId: 'q-3', text: '75', label: 'C', correct: false },
            { id: 'opt-12', qId: 'q-3', text: '100', label: 'D', correct: false },
            // Q4 - Logic
            { id: 'opt-13', qId: 'q-4', text: 'Yes', label: 'A', correct: false },
            { id: 'opt-14', qId: 'q-4', text: 'No', label: 'B', correct: true },
            { id: 'opt-15', qId: 'q-4', text: 'Cannot be determined', label: 'C', correct: false },
            // Q5 - Comprehension
            { id: 'opt-16', qId: 'q-5', text: 'The sun orbits the Earth', label: 'A', correct: false },
            { id: 'opt-17', qId: 'q-5', text: 'The sun is essential for life on Earth', label: 'B', correct: true },
            { id: 'opt-18', qId: 'q-5', text: 'Life without the sun is possible', label: 'C', correct: false }
        ];
        for (const opt of options) {
            await db.query(`
        INSERT INTO aptitude_question_options (id, question_id, option_text, option_label, is_correct)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [opt.id, opt.qId, opt.text, opt.label, opt.correct]);
        }
        console.log('✓ Options seeded');
        console.log('✅ Aptitude data seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error seeding aptitude data:', error);
        throw error;
    }
}
