import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';
import { Toaster } from 'react-hot-toast';
import { ChatProvider } from './context/ChatContext';
import ChatWidget from './components/ChatWidget';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CommunityPage from './pages/CommunityPage';
import QuizPage from './pages/QuizPage';
import ChatbotPage from './pages/ChatbotPage';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <Loading text="Checking authentication..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirect to appropriate dashboard based on role
        if (user?.role === 'admin') return <Navigate to="/admin" replace />;
        if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
        return <Navigate to="/student" replace />;
    }

    return children;
};

// Public Route - redirect authenticated users to their dashboard
const PublicRoute = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <Loading text="Loading..." />;
    }

    if (isAuthenticated) {
        if (user?.role === 'admin') return <Navigate to="/admin" replace />;
        if (user?.role === 'teacher') return <Navigate to="/teacher" replace />;
        return <Navigate to="/student" replace />;
    }

    return children;
};

// Layout with Navbar and Footer
const Layout = ({ children, hideFooter = false }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
};

// App Routes
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><LandingPage /></Layout>} />
            <Route path="/courses" element={<Layout><CoursesPage /></Layout>} />
            <Route path="/courses/:id" element={<Layout hideFooter><CourseDetailPage /></Layout>} />
            <Route path="/community" element={<Layout><CommunityPage /></Layout>} />
            <Route path="/chatbot" element={<Layout><ChatbotPage /></Layout>} />
            <Route path="/quiz/:id" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />

            {/* Auth Routes */}
            <Route path="/login" element={
                <PublicRoute>
                    <LoginPage />
                </PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute>
                    <RegisterPage />
                </PublicRoute>
            } />
            <Route path="/reset-password/:token" element={
                <PublicRoute>
                    <ResetPasswordPage />
                </PublicRoute>
            } />

            {/* Protected Routes */}
            <Route path="/student" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <Layout><StudentDashboard /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/teacher" element={
                <ProtectedRoute allowedRoles={['teacher']}>
                    <Layout><TeacherDashboard /></Layout>
                </ProtectedRoute>
            } />
            <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <Layout><AdminDashboard /></Layout>
                </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <ChatProvider>
                    <Toaster position="top-center" reverseOrder={false} />
                    <AppRoutes />
                    <ChatWidget />
                </ChatProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
