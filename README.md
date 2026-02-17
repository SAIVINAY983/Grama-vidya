# 🎓 Gram Vidya - Rural Education Platform

A technology-driven, low-bandwidth, mobile-first digital education platform designed to enhance quality education in rural areas.

![Platform Overview](https://img.shields.io/badge/Platform-Education-green)
![Tech Stack](https://img.shields.io/badge/Stack-MERN-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Features

- **Low-Bandwidth Optimized** - Works on slow 2G connections
- **Offline PDF Downloads** - Study materials available offline
- **Video Lessons** - YouTube integration + custom uploads
- **Role-Based Access** - Student, Teacher, Admin dashboards
- **Community Learning** - Discussion forum for peer interaction
- **Progress Tracking** - Track learning journey
- **Mobile-First Design** - Touch-friendly responsive UI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Clone and Install**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

2. **Configure Environment**

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gramvidya
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

3. **Seed Sample Data**
```bash
cd server
npm run seed
```

4. **Start the Application**

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

5. **Access the App**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📝 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gramvidya.com | admin123 |
| Teacher | priya@gramvidya.com | teacher123 |
| Student | amit@gramvidya.com | student123 |

## 📁 Project Structure

```
gram vidya/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth context
│   │   └── services/       # API services
│   └── public/
│
└── server/                 # Node.js Backend
    ├── config/             # Database config
    ├── controllers/        # Route handlers
    ├── middleware/         # Auth middleware
    ├── models/             # Mongoose schemas
    ├── routes/             # API routes
    └── uploads/            # File storage
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Teacher)
- `POST /api/courses/:id/enroll` - Enroll in course

### Lessons
- `POST /api/lessons/:id/video` - Upload video
- `POST /api/lessons/:id/pdf` - Upload PDF notes

### Community
- `GET /api/community` - Get posts
- `POST /api/community` - Create post
- `POST /api/community/:id/reply` - Reply to post

## 🎯 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT |
| File Upload | Multer |
| Video | YouTube Embed + Local |

## 📱 Screenshots

### Landing Page
Beautiful hero section with features overview

### Student Dashboard
Track enrolled courses and progress

### Teacher Dashboard
Create courses, modules, and upload content

### Course Player
Watch videos and download PDF notes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - feel free to use for educational purposes.

---

Made with ❤️ for Rural India

## ☁️ Deployment (Vercel)

This project is configured for deployment on [Vercel](https://vercel.com).

1. Import the project in Vercel.
2. Add the following Environment Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CLIENT_URL` (your Vercel app URL)
3. Deploy!

> **Note**: File uploads are not persistent on Vercel's serverless functions.
