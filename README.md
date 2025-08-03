# AI_Mock_Interview_System

A web-based AI-powered mock interview application that helps users practice and improve their interview skills through personalized questions and feedback.

## 🚀 Features

### Core Functionality
- **User Authentication**: Register and login with email or phone number
- **Resume-Based Interviews**: Upload your resume and get tailored questions based on your experience
- **Custom Interviews**: Choose from various subjects and experience levels
- **Real-time Video**: Practice with video recording during interviews
- **Comprehensive Feedback**: Receive detailed feedback and scoring after each interview
- **Interview History**: Track and review your past interviews

### Interview Types
- **Resume-Based**: AI analyzes your resume and generates relevant questions
- **Subject-Specific**: Choose from JavaScript, Python, Java, Product Management, Data Science, UI/UX, and more
- **Experience Levels**: Entry, Mid, and Senior level questions
- **Customizable**: Set the number of questions (5-20)

## 🛠️ Technology Stack

- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: In-memory storage (can be extended to use real database)
- **File Upload**: Multer for resume uploads
- **Video**: WebRTC for camera/microphone access

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)
- Modern web browser with camera/microphone support

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI_Mock_Interview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 📖 Usage Guide

### Getting Started

1. **Register/Login**: Create an account or login with existing credentials
2. **Choose Interview Type**:
   - **Resume Upload**: Upload your resume for personalized questions
   - **Custom Interview**: Select subject and experience level
3. **Start Interview**: Enable camera/microphone and begin the interview
4. **Answer Questions**: Respond to AI-generated questions
5. **Review Feedback**: Get detailed feedback and scoring

### Interview Flow

1. **Setup**: Configure your interview preferences
2. **Practice**: Answer questions with video recording
3. **Review**: Get comprehensive feedback and scoring
4. **Improve**: Track progress over multiple interviews

## 🏗️ Project Structure

```
AI_Mock_Interview/
├── server.js          # Express server and API routes
├── database.js        # In-memory database functions
├── app.js            # Frontend JavaScript logic
├── index.html        # Main application interface
├── styles.css        # Application styling
├── package.json      # Project dependencies and scripts
└── README.md         # Project documentation
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Interview Management
- `POST /api/resume-upload` - Upload resume file
- `POST /api/questions` - Get interview questions
- `POST /api/interviews` - Save interview results
- `GET /api/interviews/:userId` - Get user's interview history

## 🎯 Features in Detail

### Resume Analysis
- Upload PDF or DOCX resumes
- AI extracts skills and experience
- Generates relevant technical questions
- Tailors questions to your background

### Smart Question Generation
- Subject-specific questions (JavaScript, Python, etc.)
- Experience-level appropriate difficulty
- Avoids duplicate questions from previous interviews
- Dynamic question shuffling

### Real-time Practice
- Live video recording during interviews
- Microphone and camera controls
- Practice in a realistic interview environment
- Record responses for later review

### Comprehensive Feedback
- Overall interview scoring
- Question-by-question feedback
- Areas for improvement suggestions
- Performance tracking over time

## 🔒 Security Features

- Input validation and sanitization
- File upload security with Multer
- CORS configuration for cross-origin requests
- Password-based authentication (can be enhanced with JWT)

## 🚀 Future Enhancements

- [ ] Real database integration (MongoDB/PostgreSQL)
- [ ] JWT authentication
- [ ] AI-powered response analysis
- [ ] Speech-to-text transcription
- [ ] Advanced resume parsing
- [ ] Interview scheduling
- [ ] Peer practice sessions
- [ ] Mobile app version

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please open an issue in the repository.

---

**Note**: This is a demo application with in-memory storage. For production use, consider implementing a proper database and additional security measures.
