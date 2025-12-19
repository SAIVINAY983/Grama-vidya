import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, progressAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import Loading from '../components/Loading';
import {
    FiBook,
    FiPlay,
    FiCheckCircle,
    FiClock,
    FiTrendingUp,
    FiAward,
    FiBookOpen
} from 'react-icons/fi';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrolledRes, allCoursesRes, progressRes] = await Promise.all([
                courseAPI.getEnrolled(),
                courseAPI.getAll(),
                progressAPI.getMyProgress()
            ]);

            setEnrolledCourses(enrolledRes.data.courses || []);
            setAllCourses(allCoursesRes.data.courses || []);
            setProgress(progressRes.data.progress || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const completedLessons = progress.filter(p => p.status === 'completed').length;
    const inProgressLessons = progress.filter(p => p.status === 'in-progress').length;

    // Get courses not enrolled in
    const recommendedCourses = allCourses.filter(
        course => !enrolledCourses.some(ec => ec._id === course._id)
    ).slice(0, 3);

    if (loading) return <Loading text="Loading your dashboard..." />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Welcome back, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">Continue your learning journey</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <FiBook size={24} className="mb-2 opacity-80" />
                        <div className="text-3xl font-bold">{enrolledCourses.length}</div>
                        <div className="text-white/80 text-sm">Enrolled Courses</div>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <FiCheckCircle size={24} className="mb-2 opacity-80" />
                        <div className="text-3xl font-bold">{completedLessons}</div>
                        <div className="text-white/80 text-sm">Completed Lessons</div>
                    </div>
                    <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
                        <FiPlay size={24} className="mb-2 opacity-80" />
                        <div className="text-3xl font-bold">{inProgressLessons}</div>
                        <div className="text-white/80 text-sm">In Progress</div>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <FiTrendingUp size={24} className="mb-2 opacity-80" />
                        <div className="text-3xl font-bold">
                            {enrolledCourses.length > 0
                                ? Math.round((completedLessons / Math.max(1, completedLessons + inProgressLessons)) * 100)
                                : 0}%
                        </div>
                        <div className="text-white/80 text-sm">Completion Rate</div>
                    </div>
                </div>

                {/* My Courses */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
                        <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                            View All →
                        </Link>
                    </div>

                    {enrolledCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledCourses.map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <div className="card text-center py-12">
                            <FiBookOpen size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No courses yet</h3>
                            <p className="text-gray-500 mb-4">Start learning by enrolling in a course</p>
                            <Link to="/courses" className="btn btn-primary">
                                Browse Courses
                            </Link>
                        </div>
                    )}
                </section>

                {/* Recommended Courses */}
                {recommendedCourses.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                            <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                See More →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendedCourses.map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
