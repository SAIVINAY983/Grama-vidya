import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, moduleAPI, progressAPI, quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import Loading from '../components/Loading';
import {
    FiPlay,
    FiDownload,
    FiCheckCircle,
    FiClock,
    FiUsers,
    FiBookOpen,
    FiChevronDown,
    FiChevronUp,
    FiArrowLeft,
    FiLock,
    FiHelpCircle,
    FiHeart
} from 'react-icons/fi';
import ReviewSection from '../components/ReviewSection';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([]);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [expandedModules, setExpandedModules] = useState({});
    const [quizzes, setQuizzes] = useState([]);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const isEnrolled = course?.enrolledStudents?.includes(user?.id) ||
        course?.enrolledStudents?.some(s => s._id === user?.id || s === user?.id);

    useEffect(() => {
        fetchCourse();
    }, [id]);

    useEffect(() => {
        if (isEnrolled && course) {
            fetchProgress();
            fetchQuizzes();
        }
        if (isAuthenticated && user?.wishlist) {
            setIsWishlisted(user.wishlist.includes(id));
        }
    }, [isEnrolled, course, isAuthenticated, user]);

    const fetchCourse = async () => {
        try {
            const response = await courseAPI.getOne(id);
            const courseData = response.data.course;
            setCourse(courseData);

            // Set modules from populated course data
            if (courseData.modules) {
                setModules(courseData.modules);
                // Expand first module by default
                if (courseData.modules.length > 0) {
                    setExpandedModules({ [courseData.modules[0]._id]: true });
                    // Select first lesson if available
                    if (courseData.modules[0].lessons?.length > 0) {
                        setSelectedLesson(courseData.modules[0].lessons[0]);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            navigate('/courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const response = await progressAPI.getCourseProgress(id);
            const progressMap = {};
            response.data.progress.forEach(p => {
                progressMap[p.lesson?._id || p.lesson] = p.status;
            });
            setProgress(progressMap);
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    }


    const fetchQuizzes = async () => {
        try {
            const res = await quizAPI.getByCourse(id);
            setQuizzes(res.data.quizzes);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            await courseAPI.enroll(id);
            fetchCourse();
        } catch (error) {
            console.error('Error enrolling:', error);
        } finally {
            setEnrolling(false);
        }
    };

    const handleLessonSelect = (lesson) => {
        setSelectedLesson(lesson);
        // Mark as in-progress if not completed
        if (isEnrolled && progress[lesson._id] !== 'completed') {
            updateProgress(lesson._id, 'in-progress');
        }
    };

    const handleMarkComplete = async () => {
        if (!selectedLesson) return;
        await updateProgress(selectedLesson._id, 'completed');
    };

    const updateProgress = async (lessonId, status) => {
        try {
            await progressAPI.updateProgress(lessonId, { status });
            setProgress(prev => ({ ...prev, [lessonId]: status }));
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    const toggleModule = (moduleId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleId]: !prev[moduleId]
        }));
    };

    const handleWishlistToggle = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        try {
            const res = await authAPI.toggleWishlist(id);
            setIsWishlisted(res.data.isWishlisted);
            toast.success(res.data.message);
        } catch (error) {
            toast.error('Error updating wishlist');
        }
    };

    const completedCount = Object.values(progress).filter(s => s === 'completed').length;
    const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
    const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    if (loading) return <Loading text="Loading course..." />;
    if (!course) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Course Header */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-8">
                <div className="container-custom">
                    <button
                        onClick={() => navigate('/courses')}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
                    >
                        <FiArrowLeft size={20} />
                        Back to Courses
                    </button>

                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-1 bg-white/20 rounded-full text-xs capitalize">
                                    {course.category?.replace('-', ' ')}
                                </span>
                                <span className="px-2 py-1 bg-white/20 rounded-full text-xs capitalize">
                                    {course.language}
                                </span>
                                <span className="px-2 py-1 bg-white/20 rounded-full text-xs capitalize">
                                    {course.difficulty}
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-3">{course.title}</h1>
                            <p className="text-white/80 mb-4">{course.description}</p>

                            <div className="flex items-center gap-6 text-sm text-white/80">
                                <div className="flex items-center gap-2">
                                    <FiUsers size={16} />
                                    <span>{course.enrolledStudents?.length || 0} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiBookOpen size={16} />
                                    <span>{modules.length} modules</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiPlay size={16} />
                                    <span>{totalLessons} lessons</span>
                                </div>
                            </div>

                            {/* Teacher Info */}
                            <div className="flex items-center gap-3 mt-4">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="font-semibold">{course.teacher?.name?.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-medium">by {course.teacher?.name}</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Actions */}
                        <div className="flex flex-col gap-4 lg:w-80">
                            <button
                                onClick={handleWishlistToggle}
                                className={`btn w-full flex items-center justify-center gap-2 ${isWishlisted
                                    ? 'bg-red-50 text-red-600 border-red-100'
                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                    }`}
                            >
                                <FiHeart className={isWishlisted ? 'fill-red-600' : ''} size={20} />
                                {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                            </button>
                            {!isEnrolled && (
                                <div className="lg:w-80">
                                    <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl">
                                        <h3 className="text-xl font-bold mb-2">Free Course</h3>
                                        <p className="text-gray-500 mb-4">Start learning today</p>
                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="btn btn-primary w-full"
                                        >
                                            {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Progress Card */}
                            {isEnrolled && (
                                <div className="lg:w-80">
                                    <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl">
                                        <h3 className="text-lg font-bold mb-2">Your Progress</h3>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex-1">
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className="bg-primary-500 h-3 rounded-full transition-all"
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="font-bold text-primary-600">{progressPercent}%</span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {completedCount} of {totalLessons} lessons completed
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className="container-custom py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Video Player Area */}
                    <div className="lg:flex-1">
                        {selectedLesson ? (
                            <div>
                                <VideoPlayer
                                    videoType={selectedLesson.videoType}
                                    videoUrl={selectedLesson.videoUrl}
                                    youtubeId={selectedLesson.youtubeId}
                                    title={selectedLesson.title}
                                />
                                <div className="mt-4">
                                    <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
                                    {selectedLesson.description && (
                                        <p className="text-gray-500 mt-2">{selectedLesson.description}</p>
                                    )}

                                    {isEnrolled && (
                                        <div className="flex items-center gap-4 mt-4">
                                            {progress[selectedLesson._id] === 'completed' ? (
                                                <span className="flex items-center gap-2 text-green-600">
                                                    <FiCheckCircle size={20} />
                                                    Completed
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={handleMarkComplete}
                                                    className="btn btn-primary"
                                                >
                                                    <FiCheckCircle size={20} />
                                                    Mark as Complete
                                                </button>
                                            )}

                                            {selectedLesson.pdfUrl && (
                                                <a
                                                    href={selectedLesson.pdfUrl}
                                                    download
                                                    className="btn btn-outline"
                                                >
                                                    <FiDownload size={20} />
                                                    Download Notes
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center">
                                <p className="text-gray-400">Select a lesson to start learning</p>
                            </div>
                        )}
                    </div>

                    {/* Modules Sidebar */}
                    <div className="lg:w-96">
                        <div className="card sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4">Course Content</h3>
                            <div className="space-y-3">
                                {modules.map((module, idx) => (
                                    <div key={module._id} className="border border-gray-200 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleModule(module._id)}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-sm font-medium flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <span className="font-medium text-gray-800 text-left">{module.title}</span>
                                            </div>
                                            {expandedModules[module._id] ? <FiChevronUp /> : <FiChevronDown />}
                                        </button>

                                        {expandedModules[module._id] && module.lessons?.length > 0 && (
                                            <div className="divide-y divide-gray-100">
                                                {module.lessons.map(lesson => (
                                                    <button
                                                        key={lesson._id}
                                                        onClick={() => isEnrolled || lesson.isPreview ? handleLessonSelect(lesson) : null}
                                                        disabled={!isEnrolled && !lesson.isPreview}
                                                        className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${selectedLesson?._id === lesson._id
                                                            ? 'bg-primary-50 border-l-4 border-primary-500'
                                                            : 'hover:bg-gray-50'
                                                            } ${!isEnrolled && !lesson.isPreview ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {progress[lesson._id] === 'completed' ? (
                                                            <FiCheckCircle className="text-green-500 flex-shrink-0" size={18} />
                                                        ) : !isEnrolled && !lesson.isPreview ? (
                                                            <FiLock className="text-gray-400 flex-shrink-0" size={18} />
                                                        ) : (
                                                            <FiPlay className="text-gray-400 flex-shrink-0" size={18} />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-700 truncate">
                                                                {lesson.title}
                                                            </p>
                                                            {lesson.duration > 0 && (
                                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <FiClock size={12} />
                                                                    {Math.floor(lesson.duration / 60)} min
                                                                </p>
                                                            )}
                                                        </div>
                                                        {lesson.isPreview && !isEnrolled && (
                                                            <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">
                                                                Preview
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quizzes Section */}
                {isEnrolled && quizzes.length > 0 && (
                    <div className="card sticky top-24 mt-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FiHelpCircle className="text-primary-600" />
                            Quizzes
                        </h3>
                        <div className="space-y-3">
                            {quizzes.map((quiz) => (
                                <button
                                    key={quiz._id}
                                    onClick={() => navigate(`/quiz/${quiz._id}`)}
                                    className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-xl transition-colors border border-primary-100"
                                >
                                    <div className="text-left">
                                        <div className="font-medium text-gray-900">{quiz.title}</div>
                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                            <FiClock size={10} />
                                            {quiz.duration} mins • {quiz.questions.length} Questions
                                        </div>
                                    </div>
                                    <div className="bg-white p-2 rounded-full text-primary-600">
                                        <FiPlay size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <ReviewSection courseId={id} />
            </div>
        </div>
    );
};

export default CourseDetailPage;
