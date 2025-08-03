document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginPage = document.getElementById('login-page');
    const registerPage = document.getElementById('register-page');
    const homePage = document.getElementById('home-page');
    const interviewPage = document.getElementById('interview-page');
    const feedbackPage = document.getElementById('feedback-page');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const resumeForm = document.getElementById('resume-form');
    const customInterviewForm = document.getElementById('custom-interview-form');
    
    const loginMethodSelect = document.getElementById('login-method');
    const emailInput = document.querySelector('.email-input');
    const phoneInput = document.querySelector('.phone-input');
    
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');
    
    const nextQuestionBtn = document.getElementById('next-question');
    const endInterviewBtn = document.getElementById('end-interview');
    const micToggleBtn = document.getElementById('mic-toggle');
    const cameraToggleBtn = document.getElementById('camera-toggle');
    
    const saveFeedbackBtn = document.getElementById('save-feedback');
    const returnHomeBtn = document.getElementById('return-home');
    
    // State Management
    let currentUser = null;
    let interviewState = {
        type: null, // 'resume' or 'custom'
        subject: null,
        experience: null,
        questionCount: 0,
        currentQuestionIndex: -1,
        questions: [],
        answers: [],
        askedQuestionIds: [], // Track previously asked questions IDs
        feedback: null,
        recording: null,
        stream: null
    };
    
    // Speech Synthesis and Recognition
    const synth = window.speechSynthesis;
    let recognition = null;
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;
    }
    
    // Navigation Functions
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }
    
    // Login/Register Event Handlers
    loginMethodSelect.addEventListener('change', function() {
        if (this.value === 'email') {
            emailInput.classList.remove('hidden');
            phoneInput.classList.add('hidden');
        } else {
            emailInput.classList.add('hidden');
            phoneInput.classList.remove('hidden');
        }
    });
    
    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        showPage('register-page');
    });
    
    loginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showPage('login-page');
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Mock authentication logic
        const loginMethod = loginMethodSelect.value;
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        const password = document.getElementById('password').value;
        
        // In a real app, you'd validate credentials with the server
        // For this demo, we'll just simulate a successful login
        
        currentUser = {
            id: 'user123',
            name: 'Test User',
            email: email || 'test@example.com',
            phone: phone || '555-123-4567'
        };
        
        // Load past interviews
        loadInterviewHistory();
        
        // Navigate to home page
        showPage('home-page');
    });
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Mock registration logic
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const phone = document.getElementById('reg-phone').value;
        const password = document.getElementById('reg-password').value;
        
        // In a real app, you'd send this data to the server
        // For this demo, we'll just simulate a successful registration
        
        currentUser = {
            id: 'user123',
            name,
            email,
            phone
        };
        
        // Navigate to home page
        showPage('home-page');
    });
    
    // Interview Setup Event Handlers
    resumeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const resumeFile = document.getElementById('resume').files[0];
        if (!resumeFile) {
            alert('Please upload a resume file');
            return;
        }
        
        // In a real app, you would upload the resume to the server
        // and process it to extract relevant information
        
        interviewState.type = 'resume';
        interviewState.resumeFile = resumeFile;
        
        // Start the interview
        startInterview();
    });
    
    customInterviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const subject = document.getElementById('subject').value;
        const experience = document.getElementById('experience').value;
        const questionCount = parseInt(document.getElementById('questions').value);
        
        if (!subject) {
            alert('Please select a subject');
            return;
        }
        
        interviewState.type = 'custom';
        interviewState.subject = subject;
        interviewState.experience = experience;
        interviewState.questionCount = questionCount;
        
        // Start the interview
        startInterview();
    });
    
    // Interview Functionality
    async function startInterview() {
        try {
            // Set up video stream
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            document.getElementById('user-video').srcObject = stream;
            interviewState.stream = stream;
            
            // Get questions based on interview type
            if (interviewState.type === 'resume') {
                // In a real app, this would analyze the resume and generate questions
                // For this demo, we'll use a mix of general and role-based questions
                interviewState.questions = getQuestionsForResume(interviewState.resumeFile);
            } else {
                interviewState.questions = getQuestionsForSubject(
                    interviewState.subject, 
                    interviewState.experience, 
                    interviewState.questionCount
                );
            }
            
            // Reset interview state
            interviewState.currentQuestionIndex = -1;
            interviewState.answers = [];
            
            // Set interview title
            document.getElementById('interview-title').textContent = 
                interviewState.type === 'resume' ? 'Resume-Based Interview' : 
                `${formatSubject(interviewState.subject)} Interview`;
            
            // Show interview page
            showPage('interview-page');
            
            // Start with introduction
            await speakText("Hello and welcome to your mock interview. I'll be asking you a series of questions related to your experience. Please respond naturally as you would in a real interview. Let's begin.");
            
            // Ask first question
            nextQuestion();
            
        } catch (error) {
            console.error('Error starting interview:', error);
            alert('Could not access camera or microphone. Please ensure you have granted the necessary permissions.');
        }
    }
    
    async function nextQuestion() {
        interviewState.currentQuestionIndex++;
        
        if (interviewState.currentQuestionIndex >= interviewState.questions.length) {
            // End of interview, show feedback
            endInterview();
            return;
        }
        
        const currentQuestion = interviewState.questions[interviewState.currentQuestionIndex];
        
        // Display the question
        document.getElementById('current-question').textContent = currentQuestion.text;
        
        // Speak the question
        await speakText(currentQuestion.text);
        
        // Start recording the answer
        startRecording();
    }
    
    function startRecording() {
        if (!recognition) {
            console.warn('Speech recognition not supported by this browser');
            return;
        }
        
        let finalTranscript = '';
        
        recognition.onresult = function(event) {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                } else {
                    interimTranscript += transcript;
                }
            }
            
            // You could display the interim transcript if desired
        };
        
        recognition.onend = function() {
            // Save the answer
            interviewState.answers.push({
                questionId: interviewState.questions[interviewState.currentQuestionIndex].id,
                text: finalTranscript,
                timestamp: new Date().toISOString()
            });
        };
        
        recognition.start();
        interviewState.recording = true;
    }
    
    function stopRecording() {
        if (recognition && interviewState.recording) {
            recognition.stop();
            interviewState.recording = false;
        }
    }
    
    async function endInterview() {
        // Stop recording if active
        stopRecording();
        
        // Stop media stream
        if (interviewState.stream) {
            interviewState.stream.getTracks().forEach(track => track.stop());
        }
        
        // Generate feedback (in a real app, this would be done by the AI)
        interviewState.feedback = generateFeedback(interviewState.questions, interviewState.answers);
        
        // Display feedback
        displayFeedback();
        
        // Show feedback page
        showPage('feedback-page');
        
        // Save the interview data
        saveInterview();
        
        // Add this interview's question IDs to the user's asked questions
        if (currentUser) {
            const askedQuestionIds = interviewState.questions.map(q => q.id);
            // In a real app, you would store this in the database
            // For this demo, we'll just store it in memory
            interviewState.askedQuestionIds = interviewState.askedQuestionIds.concat(askedQuestionIds);
        }
    }
    
    // Event listeners for interview controls
    nextQuestionBtn.addEventListener('click', function() {
        // Stop recording the current answer
        stopRecording();
        
        // Move to the next question
        nextQuestion();
    });
    
    endInterviewBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to end the interview?')) {
            endInterview();
        }
    });
    
    micToggleBtn.addEventListener('click', function() {
        const stream = document.getElementById('user-video').srcObject;
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            this.textContent = audioTrack.enabled ? '🎤' : '🔇';
        }
    });
    
    cameraToggleBtn.addEventListener('click', function() {
        const stream = document.getElementById('user-video').srcObject;
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            this.textContent = videoTrack.enabled ? '📷' : '📵';
        }
    });
    
    // Feedback page event handlers
    saveFeedbackBtn.addEventListener('click', function() {
        alert('Feedback saved successfully!');
    });
    
    returnHomeBtn.addEventListener('click', function() {
        showPage('home-page');
        loadInterviewHistory(); // Refresh the interview history
    });
    
    // Helper Functions
    function speakText(text) {
        return new Promise((resolve) => {
            if (synth && text) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = resolve;
                synth.speak(utterance);
            } else {
                resolve();
            }
        });
    }
    
    function formatSubject(subject) {
        // Convert "javascript" to "JavaScript Developer"
        const subjectMap = {
            'javascript': 'JavaScript Developer',
            'python': 'Python Developer',
            'java': 'Java Developer',
            'product-management': 'Product Management',
            'data-science': 'Data Science',
            'ui-ux': 'UI/UX Designer',
            'marketing': 'Digital Marketing'
        };
        
        return subjectMap[subject] || subject;
    }
    
    function getQuestionsForResume(resumeFile) {
        // In a real app, this would analyze the resume content
        // For this demo, we'll return a mix of general and technical questions
        
        // General questions that would be asked regardless of the resume
        const generalQuestions = [
            { id: 'g1', text: 'Tell me about yourself and your background.' },
            { id: 'g2', text: 'What are your greatest professional strengths?' },
            { id: 'g3', text: 'What do you consider to be your weaknesses?' },
            { id: 'g4', text: 'Why are you interested in this position?' },
            { id: 'g5', text: 'Where do you see yourself in five years?' }
        ];
        
        // Let's pretend we've analyzed the resume and found it's for a JavaScript developer
        const technicalQuestions = [
            { id: 't1', text: 'Explain the difference between var, let, and const in JavaScript.' },
            { id: 't2', text: 'What is closure in JavaScript?' },
            { id: 't3', text: 'How does the "this" keyword work in JavaScript?' },
            { id: 't4', text: 'Can you explain promises and async/await?' },
            { id: 't5', text: 'What is the event loop in JavaScript?' }
        ];
        
        // Combine and shuffle the questions
        return shuffleArray([...generalQuestions, ...technicalQuestions]);
    }
    
    function getQuestionsForSubject(subject, experience, count) {
        // In a real app, this would fetch questions from a database
        // For this demo, we'll return hardcoded questions based on the subject
        
        const questions = {
            'javascript': [
                { id: 'js1', text: 'Explain the difference between var, let, and const in JavaScript.' },
                { id: 'js2', text: 'What is closure in JavaScript?' },
                { id: 'js3', text: 'How does the "this" keyword work in JavaScript?' },
                { id: 'js4', text: 'Can you explain promises and async/await?' },
                { id: 'js5', text: 'What is the event loop in JavaScript?' },
                { id: 'js6', text: 'Explain prototypal inheritance in JavaScript.' },
                { id: 'js7', text: 'What are the differences between arrow functions and regular functions?' },
                { id: 'js8', text: 'How do you optimize the performance of a JavaScript application?' },
                { id: 'js9', text: 'Explain the concept of hoisting in JavaScript.' },
                { id: 'js10', text: 'What are Web Workers and when would you use them?' }
            ],
            'python': [
                { id: 'py1', text: 'What are Python decorators and how do they work?' },
                { id: 'py2', text: 'Explain list comprehensions in Python.' },
                { id: 'py3', text: 'What is the difference between a tuple and a list in Python?' },
                { id: 'py4', text: 'How does memory management work in Python?' },
                { id: 'py5', text: 'What are generators in Python and when would you use them?' },
                { id: 'py6', text: 'Explain the GIL (Global Interpreter Lock) and its implications.' },
                { id: 'py7', text: 'How do you handle exceptions in Python?' },
                { id: 'py8', text: 'What are context managers in Python?' },
                { id: 'py9', text: 'Explain the differences between Python 2 and Python 3.' },
                { id: 'py10', text: 'How would you optimize a Python application?' }
            ],
            // Add more subjects as needed
        };
        const generalQuestions = [
            // General questions common across all roles
            { id: 'gen1', text: 'Tell me about yourself and your background.' },
            { id: 'gen2', text: 'What are your greatest professional strengths?' },
            { id: 'gen3', text: 'What do you consider to be your weaknesses?' },
            { id: 'gen4', text: 'Where do you see yourself in five years?' },
            { id: 'gen5', text: 'Why are you interested in this role?' }
        ];

        // Filter out previously asked questions if any
        let availableQuestions = [...generalQuestions];
        if (questions[subject]) {
            availableQuestions = availableQuestions.concat(
                questions[subject].filter(q => !interviewState.askedQuestionIds.includes(q.id))
            );
        }
        
        // If we don't have enough new questions, we'll have to reuse some
        if (availableQuestions.length < count) {
            // Add more questions from the pool, even if previously asked
            const additionalNeeded = count - availableQuestions.length;
            const reusableQuestions = questions[subject] ? 
                questions[subject].filter(q => interviewState.askedQuestionIds.includes(q.id)) : [];
            
            availableQuestions = availableQuestions.concat(
                shuffleArray(reusableQuestions).slice(0, additionalNeeded)
            );
        }
        
        // Shuffle and limit to requested count
        return shuffleArray(availableQuestions).slice(0, count);
    }
    
    function generateFeedback(questions, answers) {
        // In a real app, this would be done by an AI service
        // For this demo, we'll generate some mock feedback
        
        const overallScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
        
        const strengths = [
            'Clear and concise communication',
            'Good technical knowledge',
            'Structured answers using the STAR method',
            'Showed enthusiasm and passion for the field',
            'Provided concrete examples from past experience'
        ];
        
        const improvements = [
            'Could provide more specific examples',
            'Consider practicing more technical questions',
            'Try to be more concise in responses',
            'Work on body language and eye contact',
            'Elaborate more on your problem-solving process'
        ];
        
        // Randomly select 2-3 strengths and improvements
        const selectedStrengths = shuffleArray(strengths).slice(0, Math.floor(Math.random() * 2) + 2);
        const selectedImprovements = shuffleArray(improvements).slice(0, Math.floor(Math.random() * 2) + 2);
        
        // Generate question-specific feedback
        const questionFeedback = questions.map((q, index) => {
            const answerQuality = Math.random();
            let feedback;
            
            if (answerQuality > 0.7) {
                feedback = 'Excellent answer. You provided clear examples and demonstrated strong knowledge.';
            } else if (answerQuality > 0.4) {
                feedback = 'Good answer. You covered the main points but could have elaborated more.';
            } else {
                feedback = 'This answer needs improvement. Consider researching this topic further.';
            }
            
            return {
                question: q.text,
                answer: answers[index] ? answers[index].text : '(No answer recorded)',
                feedback,
                score: Math.floor(answerQuality * 100)
            };
        });
        
        return {
            overallScore,
            strengths: selectedStrengths,
            improvements: selectedImprovements,
            questionFeedback
        };
    }
    
    function displayFeedback() {
        const feedback = interviewState.feedback;
        
        // Display overall score
        document.getElementById('score-value').textContent = feedback.overallScore;
        
        // Display overall feedback
        let overallFeedbackText = `You scored ${feedback.overallScore} out of 100. `;
        
        if (feedback.overallScore > 90) {
            overallFeedbackText += "Excellent job! You're ready for real interviews.";
        } else if (feedback.overallScore > 80) {
            overallFeedbackText += "Great job! With a bit more practice, you'll be fully prepared.";
        } else if (feedback.overallScore > 70) {
            overallFeedbackText += 'Good effort. Focus on the improvement areas and continue practicing.';
        } else {
            overallFeedbackText += 'You need more practice. Focus on the suggested improvements.';
        }
        
        document.getElementById('overall-feedback').textContent = overallFeedbackText;
        
        // Display question feedback
        const questionResponsesDiv = document.getElementById('question-responses');
        questionResponsesDiv.innerHTML = '';
        
        feedback.questionFeedback.forEach((qf, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-item';
            questionDiv.innerHTML = `
                <h3>Question ${index + 1}: ${qf.question}</h3>
                <p><strong>Your Answer:</strong> ${qf.answer}</p>
                <p><strong>Feedback:</strong> ${qf.feedback}</p>
                <p><strong>Score:</strong> ${qf.score}/100</p>
            `;
            questionResponsesDiv.appendChild(questionDiv);
        });
        
        // Display improvement areas
        const improvementList = document.getElementById('improvement-list');
        improvementList.innerHTML = '';
        
        feedback.improvements.forEach(improvement => {
            const li = document.createElement('li');
            li.textContent = improvement;
            improvementList.appendChild(li);
        });
    }
    
    function loadInterviewHistory() {
        // In a real app, this would fetch interview history from a database
        // For this demo, we'll create some mock data
        
        const interviewHistory = document.getElementById('interview-history');
        
        // Check if the user has any past interviews
        if (!currentUser || !interviewState.askedQuestionIds.length) {
            interviewHistory.innerHTML = '<p class="empty-state">No past interviews found</p>';
            return;
        }
        
        // Mock history data
        const mockHistory = [
            {
                id: 'int1',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                type: 'JavaScript Developer',
                score: 85
            },
            {
                id: 'int2',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
                type: 'Python Developer',
                score: 78
            }
        ];
        
        interviewHistory.innerHTML = '';
        mockHistory.forEach(interview => {
            const interviewItem = document.createElement('div');
            interviewItem.className = 'interview-item';
            interviewItem.innerHTML = `
                <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                    <div>
                        ${interview.date} - ${interview.type}
                    </div>
                    <div>
                        Score: ${interview.score}/100
                        <button class="btn secondary" style="margin-left: 10px;"
                            onclick="alert('Viewing feedback for interview ${interview.id}')">
                            View Feedback
                        </button>
                    </div>
                </div>
            `;
            interviewHistory.appendChild(interviewItem);
        });
    }
    
    function saveInterview() {
        // In a real app, this would save the interview data to a database
        console.log('Saving interview data:', {
            user: currentUser,
            interview: interviewState
        });
        
        // For this demo, we'll just simulate success
        console.log('Interview saved successfully');
    }
    
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    // Initialize the app by showing the login page
    showPage('login-page');
});