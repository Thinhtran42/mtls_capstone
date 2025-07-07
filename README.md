# MTLS - Music Teaching and Learning System

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-UNLICENSED-red.svg)
![Node](https://img.shields.io/badge/node-18.x-green.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)

A comprehensive online music education platform with AI integration, built with NestJS and React, featuring advanced music technologies like VexFlow, Magenta.js, and pitch detection.

## 🎵 Key Features

### 🎓 Educational System

- **Course Management**: Create and manage music courses with hierarchical structure (Course → Module → Lesson)
- **Diverse Content**: Video, audio, images, PDF, and music notation support
- **Interactive Exercises**: Quiz, Exercise, Assignment with automatic grading
- **Progress Tracking**: Detailed analytics on student learning progress
- **Discussion Forums**: Course and lesson-specific discussion boards

### 🤖 AI Music Features

- **AI Melody Generator**: Automatic melody generation using Magenta.js
- **AI Chord Generator**: Intelligent chord progression creation
- **AI Rhythm Generator**: Dynamic rhythm pattern generation
- **AI Quiz Generator**: Automated music quiz creation
- **Smart Feedback**: Intelligent feedback system for assignments

### 🎼 Music Tools

- **Music Notation**: Display and edit musical notation with VexFlow
- **Pitch Detection**: Real-time pitch recognition from microphone input
- **Audio Synthesis**: Sound synthesis with Tone.js
- **Practice Exercises**:
  - Note Identification
  - Keyboard Note Identification (Virtual Piano)
  - Key Signature Identification
  - Pitch Detection Training
  - Listening Exercises

### 👥 User Management

- **3 User Roles**: Admin, Teacher, Student
- **Multi-auth Support**: Email/Password, Google OAuth
- **Permission Control**: Role-based access control (RBAC)
- **Profile Management**: Personal information and settings management

## 🏗️ System Architecture

This is a **client-server monolithic architecture** with Docker containerization:

```
MTLS/
├── MTLS_api/          # Backend Monolithic API (NestJS)
├── MTLS_UI/           # Frontend SPA (React)
```

### Backend (MTLS_api)

- **Architecture**: Monolithic NestJS application
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport + Google OAuth
- **File Storage**: AWS S3 + Firebase Storage
- **AI Integration**: OpenAI API
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker

### Frontend (MTLS_UI)

- **Architecture**: Single Page Application (SPA)
- **Framework**: React 18 with Vite
- **UI Library**: Material-UI (MUI)
- **Audio**: Tone.js, Howler.js
- **Music**: VexFlow, Magenta.js, Pitchy
- **Charts**: Recharts
- **Routing**: React Router Dom v6
- **Containerization**: Docker

## 🛠️ Technology Stack

### Backend Dependencies

```json
{
  "frameworks": ["NestJS", "Express"],
  "database": ["MongoDB", "Mongoose"],
  "auth": ["JWT", "Passport", "Google OAuth2"],
  "ai": ["OpenAI", "Python Shell"],
  "storage": ["AWS S3", "Firebase Admin"],
  "monitoring": ["Winston", "Node OS Utils"],
  "validation": ["Class Validator", "Class Transformer"]
}
```

### Frontend Dependencies

```json
{
  "ui": ["React", "Material-UI", "Emotion"],
  "audio": ["Tone.js", "Howler.js", "Pitchy"],
  "music": ["VexFlow", "Magenta.js"],
  "forms": ["React Hook Form", "Yup"],
  "utils": ["Axios", "Day.js", "React Router Dom"]
}
```

## 📋 System Requirements

- **Node.js**: >= 18.x
- **MongoDB**: >= 5.x
- **Python**: >= 3.8 (for AI features)
- **Docker**: >= 20.x (optional)
- **Browser**: Chrome, Firefox, Safari (latest versions)

## 🚀 Installation & Setup

### 1. Clone repository

```bash
git clone <repository-url>
cd mtls
```

### 2. Backend Setup

```bash
cd MTLS_api

# Install dependencies
npm install

# Create environment files
cp .env.example .env.development
cp .env.example .env.production

# Configure database and services in .env files
```

### 3. Frontend Setup

```bash
cd MTLS_UI

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### 4. Run Development Mode

```bash
# Terminal 1 - Backend
cd MTLS_api
npm run start:dev

# Terminal 2 - Frontend
cd MTLS_UI
npm run dev
```

## ⚙️ Configuration

### Backend Environment (.env.development)

```env
# Database
DATABASE_URI=mongodb://localhost:27017
DATABASE_NAME=mtls_dev
DATABASE_USER=your_username
DATABASE_PASS=your_password

# JWT
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET=your_s3_bucket

# Email (Nodemailer)
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### Frontend Environment (.env)

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_CONFIG=your_firebase_config
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🐳 Docker Deployment

### Backend

```bash
cd MTLS_api
docker-compose up -d
```

### Frontend

```bash
cd MTLS_UI
docker-compose up -d
```

## 📚 API Documentation

API documentation is automatically generated with Swagger and accessible at:

```
http://localhost:3000/api
```

### Main API Endpoints

- **Authentication**: `/auth/*`
- **Users**: `/users/*`
- **Courses**: `/courses/*`
- **Lessons**: `/lessons/*`
- **Quizzes**: `/quizzes/*`
- **Exercises**: `/exercises/*`
- **Assignments**: `/assignments/*`
- **Analytics**: `/analytics/*`

## 🚢 Production Deployment

### Production Build

```bash
# Backend
cd MTLS_api
npm run build
npm run start:prod

# Frontend
cd MTLS_UI
npm run build
npm run preview
```

### CI/CD with GitHub Actions

The project includes CI/CD pipeline for automated deployment to DigitalOcean. See details in `MTLS_UI/docs/deployment_setup.md`.

## 🎯 Usage Guide

### For Students

1. Register/Login to your account
2. Browse and enroll in courses
3. Study lessons with video, audio, and notation content
4. Complete quizzes, exercises, and assignments
5. Participate in discussions
6. Practice with interactive exercises
7. Use AI tools for music creation

### For Teachers

1. Create and manage courses
2. Upload multimedia content
3. Create quizzes, exercises, and assignments
4. Track student progress
5. Grade assignments and provide feedback
6. Manage discussions and forums

### For Admins

1. Manage users and permissions
2. Monitor system analytics
3. Configure AI settings
4. Manage content and data

## 🧪 Testing

```bash
# Backend tests
cd MTLS_api
npm run test
npm run test:e2e

# Frontend tests
cd MTLS_UI
npm run test
```

## 📄 Project Structure

### Backend (MTLS_api/src/)

```
src/
├── auth/              # Authentication & authorization
├── user/              # User management
├── course/            # Course management
├── lesson/            # Lesson content
├── quiz/              # Quiz system
├── exercise/          # Exercise system
├── assignment/        # Assignment system
├── analytics/         # Analytics & reporting
├── ai-config/         # AI configuration
├── firebase/          # Firebase integration
└── ...
```

### Frontend (MTLS_UI/src/)

```
src/
├── components/        # Reusable components
├── pages/            # Page components
├── contexts/         # React contexts
├── services/         # API services
├── utils/            # Utility functions
├── vexflow/          # Music notation components
├── styles/           # Styling
└── ...
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions:

1. Check [Issues](../../issues) to see if the problem has been reported
2. Create a new issue with detailed description
3. Contact the team via email

## 📝 License

This project uses UNLICENSED license. See the `LICENSE` file for details.

## 🙏 Acknowledgments

- [VexFlow](https://vexflow.com/) - Music notation rendering
- [Magenta.js](https://magenta.tensorflow.org/js) - AI music generation
- [Tone.js](https://tonejs.github.io/) - Audio synthesis
- [Material-UI](https://mui.com/) - React UI framework
- [NestJS](https://nestjs.com/) - Node.js framework

---

**Built with ❤️ for the music education community**
