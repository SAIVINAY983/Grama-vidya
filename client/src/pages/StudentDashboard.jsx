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

    FiBookOpen,
    FiHeart
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { authAPI } from '../services/api';

const StudentDashboard = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [allCourses, setAllCourses] = useState([]);
    const [progress, setProgress] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrolledRes, allCoursesRes, progressRes, wishlistRes] = await Promise.all([
                courseAPI.getEnrolled(),
                courseAPI.getAll(),
                progressAPI.getMyProgress(),
                authAPI.getWishlist()
            ]);

            setEnrolledCourses(enrolledRes.data.courses || []);
            setAllCourses(allCoursesRes.data.courses || []);
            setProgress(progressRes.data.progress || []);
            setWishlist(wishlistRes.data.wishlist || []);
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
                        {t('dashboard.welcome')}, {user?.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-500 mt-1">{t('dashboard.continueLearning')}</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <FiBook size={24} className="mb-2 opacity-80" />
                        <div className="text-3xl font-bold">{enrolledCourses.length}</div>
                        <div className="text-white/80 text-sm">{t('dashboard.enrolledCourses')}</div>
                    </div>
                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <FiCheckCircle size={24} className="mb-2 opacity-80" />
                        <div className="text-3xl font-bold">{completedLessons}</div>
                        <div className="text-white/80 text-sm">{t('dashboard.completedLessons')}</div>
                    </div>
                    <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
                        <FiPlay size={24} className="mb-2 opacity-80" />
                        <div className="text-3xl font-bold">{inProgressLessons}</div>
                        <div className="text-white/80 text-sm">{t('dashboard.inProgress')}</div>
                    </div>
                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <FiTrendingUp size={24} className="mb-2 opacity-80" />
                        <div className="text-3xl font-bold">
                            {enrolledCourses.length > 0
                                ? Math.round((completedLessons / Math.max(1, completedLessons + inProgressLessons)) * 100)
                                : 0}%
                        </div>
                        <div className="text-white/80 text-sm">{t('dashboard.completionRate')}</div>
                    </div>
                </div>

                {/* Video classes removed */}

                {/* My Courses */}
                <section className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">{t('dashboard.myCourses')}</h2>
                        <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                            {t('dashboard.viewAll')} →
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
                            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('dashboard.noCourses')}</h3>
                            <p className="text-gray-500 mb-4">{t('dashboard.startLearningMsg')}</p>
                            <Link to="/courses" className="btn btn-primary">
                                {t('dashboard.browseCourses')}
                            </Link>
                        </div>
                    )}
                </section>

                {/* My Wishlist */}
                {wishlist.length > 0 && (
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <FiHeart className="text-red-500 fill-red-500" size={20} />
                                {t('dashboard.myWishlist')}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlist.map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Recommended Courses */}
                {recommendedCourses.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">{t('dashboard.recommended')}</h2>
                            <Link to="/courses" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                                {t('dashboard.seeMore')} →
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
