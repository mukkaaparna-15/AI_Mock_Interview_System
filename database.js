const db = {
    users: [],
    interviews: [],
    questions: {
        javascript: [],
        python: [],
        // Other subjects
    }
};

async function saveUser(user) {
    const newUser = {
        id: 'user-' + Date.now(),
        ...user,
        askedQuestionIds: []
    };
    db.users.push(newUser);
    return newUser;
}

async function getUser({ email, phone }) {
    return db.users.find(user => 
        (email && user.email === email) || 
        (phone && user.phone === phone)
    );
}

async function saveInterview(interview) {
    const newInterview = {
        id: 'int-' + Date.now(),
        ...interview
    };
    db.interviews.push(newInterview);
    
    // Update user's asked question IDs
    const user = db.users.find(u => u.id === interview.userId);
    if (user) {
        const questionIds = interview.questions.map(q => q.id);
        user.askedQuestionIds = [...new Set([...user.askedQuestionIds, ...questionIds])];
    }
    
    return newInterview;
}

async function getInterviews(userId) {
    return db.interviews.filter(interview => interview.userId === userId);
}

module.exports = {
    db,
    saveUser,
    getUser,
    saveInterview,
    getInterviews
};