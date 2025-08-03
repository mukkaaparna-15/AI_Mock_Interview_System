const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { db, saveUser, getUser, saveInterview, getInterviews } = require('./database');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// File upload configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        // Check if user already exists
        const existingUser = await getUser({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create new user
        const user = await saveUser({ name, email, phone, password });
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        
        // Find user by email or phone
        const user = await getUser({ email, phone });
        
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/resume-upload', upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // In a real app, you would process the resume here
        // For example, extract text from PDF/DOCX, analyze skills, etc.
        
        res.json({
            message: 'Resume uploaded successfully',
            filename: req.file.filename,
            path: req.file.path
        });
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/questions', async (req, res) => {
    try {
        const { type, subject, experience, count, askedQuestionIds = [] } = req.body;
        
        // In a real app, you would fetch questions from a database
        // For this demo, we'll return hardcoded questions
        
        // Generate questions based on type, subject, etc.
        let questions = [];
        
        if (type === 'resume') {
            // Resume-based questions would be dynamically generated
            // based on skills and experience extracted from the resume
            questions = getMockQuestionsForResume();
        } else {
            questions = getMockQuestionsForSubject(subject, experience);
        }
        
        // Filter out previously asked questions
        questions = questions.filter(q => !askedQuestionIds.includes(q.id));
        
        // If we don't have enough questions, add some random ones
        if (questions.length < count) {
            const additionalQuestions = getGeneralQuestions(count - questions.length);
            questions = [...questions, ...additionalQuestions];
        }
        
        // Shuffle and limit to requested count
        questions = shuffleArray(questions).slice(0, count);
        
        res.json({
            questions
        });
    } catch (error) {
        console.error('Questions fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/interviews', async (req, res) => {
    try {
        const { userId, questions, answers, feedback } = req.body;
        
        // Save interview data
        const interview = await saveInterview({
            userId,
            questions,
            answers,
            feedback,
            date: new Date()
        });
        
        res.status(201).json({
            message: 'Interview saved successfully',
            interviewId: interview.id
        });
    } catch (error) {
        console.error('Interview save error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/interviews/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Get user's interviews
        const interviews = await getInterviews(userId);
        
        res.json({
            interviews
        });
    } catch (error) {
        console.error('Interviews fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper Functions
function getMockQuestionsForResume() {
    // Generate questions based on resume analysis
    // In a real app, this would be dynamic
    return [
        { id: 'r1', text: 'I see you have experience with React. Can you explain the component lifecycle?' },
        { id: 'r2', text: 'Your resume mentions a project using Node.js. What challenges did you face?' },
        { id: 'r3', text: 'You listed SQL as a skill. Can you explain the difference between INNER and LEFT JOIN?' },
        { id: 'r4', text: 'How did you implement the authentication system mentioned in your portfolio project?' },
        { id: 'r5', text: 'What was your role in the team project at your previous company?' }
    ];
}

function getMockQuestionsForSubject(subject, experience) {
    // Return questions based on subject and experience level
    const questions = {
        'javascript': [
            { id: 'js1', text: 'Explain the difference between var, let, and const in JavaScript.' },
            { id: 'js2', text: 'What is closure in JavaScript?' },
            { id: 'js3', text: 'How does the "this" keyword work in JavaScript?' },
            { id: 'js4', text: 'Can you explain promises and async/await?' },
            { id: 'js5', text: 'What is the event loop in JavaScript?' }
        ],
        'python': [
            { id: 'py1', text: 'What are Python decorators and how do they work?' },
            { id: 'py2', text: 'Explain list comprehensions in Python.' },
            { id: 'py3', text: 'What is the difference between a tuple and a list in Python?' },
            { id: 'py4', text: 'How does memory management work in Python?' },
            { id: 'py5', text: 'What are generators in Python and when would you use them?' }
        ],
        // Add more subjects as needed
    };
    
    return questions[subject] || getGeneralQuestions(5);
}

function getGeneralQuestions(count) {
    const generalQuestions = [
        { id: 'gen1', text: 'Tell me about yourself and your background.' },
        { id: 'gen2', text: 'What are your greatest professional strengths?' },
        { id: 'gen3', text: 'What do you consider to be your weaknesses?' },
        { id: 'gen4', text: 'Where do you see yourself in five years?' },
        { id: 'gen5', text: 'Why are you interested in this position?' }
    ];
    
    return generalQuestions.slice(0, count);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});