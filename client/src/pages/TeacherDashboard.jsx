import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { courseAPI, moduleAPI, lessonAPI, quizAPI } from '../services/api';
import Loading from '../components/Loading';
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiBook,
    FiUsers,
    FiVideo,
    FiFileText,
    FiChevronDown,
    FiChevronUp,
    FiUpload,
    FiLink,
    FiX,
    FiCheck,

    FiEye,
    FiUploadCloud,
    FiHelpCircle,
    FiClock
} from 'react-icons/fi';

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [showModuleModal, setShowModuleModal] = useState(false);
    const [showLessonModal, setShowLessonModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [editingCourse, setEditingCourse] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Quiz States
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [quizResults, setQuizResults] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [courseQuizzes, setCourseQuizzes] = useState({}); // Map courseId -> quizzes[]

    const [courseForm, setCourseForm] = useState({
        title: '',
        description: '',
        category: 'other',
        language: 'english',
        difficulty: 'beginner'
    });

    const [moduleForm, setModuleForm] = useState({ title: '', description: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [lessonForm, setLessonForm] = useState({
        title: '',
        description: '',
        videoType: 'youtube',
        videoUrl: '',
        duration: 0
    });

    const [quizForm, setQuizForm] = useState({
        title: '',
        duration: 10,
        passingMarks: 0,
        questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }]
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await courseAPI.getMyCourses();
            setCourses(response.data.courses || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            let newCourse;
            if (editingCourse) {
                await courseAPI.update(editingCourse._id, courseForm);
            } else {
                const response = await courseAPI.create(courseForm);
                newCourse = response.data.course;
            }
            await fetchCourses();
            setShowCourseModal(false);
            setCourseForm({ title: '', description: '', category: 'other', language: 'english', difficulty: 'beginner' });
            setEditingCourse(null);
            // Auto-expand newly created course
            if (newCourse) {
                setExpandedCourse(newCourse._id);
            }
        } catch (err) {
            console.error('Error saving course:', err);
            setError(err.response?.data?.message || 'Failed to save course. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditCourse = (course) => {
        setEditingCourse(course);
        setCourseForm({
            title: course.title,
            description: course.description,
            category: course.category,
            language: course.language,
            difficulty: course.difficulty
        });
        setShowCourseModal(true);
    };

    const handleDeleteCourse = async (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                await courseAPI.delete(courseId);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting course:', error);
            }
        }
    };

    const handleTogglePublish = async (course) => {
        try {
            await courseAPI.update(course._id, { isPublished: !course.isPublished });
            fetchCourses();
        } catch (error) {
            console.error('Error updating course:', error);
        }
    };

    const handleCreateModule = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await moduleAPI.create({ ...moduleForm, course: selectedCourse._id });
            await fetchCourses();
            setShowModuleModal(false);
            setModuleForm({ title: '', description: '' });
        } catch (err) {
            console.error('Error creating module:', err);
            setError(err.response?.data?.message || 'Failed to create module.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm('Delete this module and all its lessons?')) {
            try {
                await moduleAPI.delete(moduleId);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting module:', error);
            }
        }
    };


    const fetchCourseQuizzes = async (courseId) => {
        try {
            const res = await quizAPI.getByCourse(courseId);
            setCourseQuizzes(prev => ({ ...prev, [courseId]: res.data.quizzes }));
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        }
    };

    const handleDeleteQuiz = async (quizId, courseId) => {
        if (window.confirm('Are you sure you want to delete this quiz?')) {
            try {
                await quizAPI.delete(quizId);
                fetchCourseQuizzes(courseId);
            } catch (error) {
                console.error('Error deleting quiz:', error);
            }
        }
    };



    const handleCreateLesson = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const response = await lessonAPI.create({ ...lessonForm, module: selectedModule._id });
            const lessonId = response.data.lesson._id;

            if (lessonForm.videoType === 'upload' && videoFile) {
                const formData = new FormData();
                formData.append('video', videoFile);
                await lessonAPI.uploadVideo(lessonId, formData);
            }

            await fetchCourses();
            setShowLessonModal(false);
            setLessonForm({ title: '', description: '', videoType: 'youtube', videoUrl: '', duration: 0 });
            setVideoFile(null);
        } catch (err) {
            console.error('Error creating lesson:', err);
            setError(err.response?.data?.message || 'Failed to create lesson.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm('Delete this lesson?')) {
            try {
                await lessonAPI.delete(lessonId);
                fetchCourses();
            } catch (error) {
                console.error('Error deleting lesson:', error);
            }
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await quizAPI.create({ ...quizForm, courseId: selectedCourse._id });
            await fetchCourseQuizzes(selectedCourse._id);
            setShowQuizModal(false);
            setQuizForm({
                title: '',
                duration: 10,
                passingMarks: 0,
                questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }]
            });
            alert('Quiz created successfully!');
        } catch (err) {
            console.error('Error creating quiz:', err);
            setError(err.response?.data?.message || 'Failed to create quiz.');
        } finally {
            setSubmitting(false);
        }
    };

    const addQuestion = () => {
        setQuizForm({
            ...quizForm,
            questions: [...quizForm.questions, { question: '', options: ['', '', '', ''], correctOption: 0 }]
        });
    };

    const updateQuestion = (index, field, value) => {
        const newQuestions = [...quizForm.questions];
        newQuestions[index][field] = value;
        setQuizForm({ ...quizForm, questions: newQuestions });
    };

    const updateOption = (qIndex, oIndex, value) => {
        const newQuestions = [...quizForm.questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuizForm({ ...quizForm, questions: newQuestions });
    };

    const handleViewResults = async (quiz) => {
        try {
            setSelectedQuiz(quiz);
            const res = await quizAPI.getResults(quiz._id);
            setQuizResults(res.data.results);
            setShowResultsModal(true);
        } catch (error) {
            console.error('Error fetching results:', error);
            setError('Failed to fetch quiz results');
        }
    };

    const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0);

    if (loading) return <Loading text="Loading your dashboard..." />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                            Teacher Dashboard
                        </h1>
                        <p className="text-gray-500 mt-1">Manage your courses and content</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCourse(null);
                            setCourseForm({ title: '', description: '', category: 'other', language: 'english', difficulty: 'beginner' });
                            setShowCourseModal(true);
                        }}
                        className="btn btn-primary"
                    >
                        <FiPlus size={20} />
                        Create Course
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="card">
                        <FiBook size={24} className="text-primary-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
                        <div className="text-gray-500 text-sm">Total Courses</div>
                    </div>
                    <div className="card">
                        <FiEye size={24} className="text-green-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                            {courses.filter(c => c.isPublished).length}
                        </div>
                        <div className="text-gray-500 text-sm">Published</div>
                    </div>
                    <div className="card">
                        <FiUsers size={24} className="text-secondary-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
                        <div className="text-gray-500 text-sm">Total Students</div>
                    </div>
                    <div className="card">
                        <FiVideo size={24} className="text-purple-600 mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                            {courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
                        </div>
                        <div className="text-gray-500 text-sm">Total Modules</div>
                    </div>
                </div>

                {/* Courses List */}
                <div className="space-y-4">
                    {courses.length === 0 ? (
                        <div className="card text-center py-12">
                            <FiBook size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No courses yet</h3>
                            <p className="text-gray-500 mb-4">Create your first course to get started</p>
                            <button onClick={() => setShowCourseModal(true)} className="btn btn-primary">
                                <FiPlus size={20} />
                                Create Course
                            </button>
                        </div>
                    ) : (
                        courses.map(course => (
                            <div key={course._id} className="card">
                                {/* Course Header */}
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {course.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm line-clamp-2">{course.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <span>{course.enrolledStudents?.length || 0} students</span>
                                            <span>{course.modules?.length || 0} modules</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleTogglePublish(course)}
                                            className={`p-2 rounded-lg transition-colors ${course.isPublished
                                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                            title={course.isPublished ? 'Unpublish' : 'Publish'}
                                        >
                                            {course.isPublished ? <FiEye size={18} /> : <FiEye size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleEditCourse(course)}
                                            className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                                        >
                                            <FiEdit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course._id)}
                                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                                        >
                                            <FiTrash2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                const newExpanded = expandedCourse === course._id ? null : course._id;
                                                setExpandedCourse(newExpanded);
                                                if (newExpanded) fetchCourseQuizzes(course._id);
                                            }}
                                            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                        >
                                            {expandedCourse === course._id ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Content - Modules */}
                                {expandedCourse === course._id && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-medium text-gray-700">Modules</h4>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setShowQuizModal(true);
                                                    }}
                                                    className="btn btn-outline text-sm py-2 flex items-center gap-1"
                                                >
                                                    <FiHelpCircle size={16} />
                                                    Add Quiz
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedCourse(course);
                                                        setShowModuleModal(true);
                                                    }}
                                                    className="btn btn-outline text-sm py-2 flex items-center gap-1"
                                                >
                                                    <FiPlus size={16} />
                                                    Add Module
                                                </button>
                                            </div>
                                        </div>



                                        {/* Quizzes List */}
                                        {courseQuizzes[course._id]?.length > 0 && (
                                            <div className="mb-6 space-y-3">
                                                <h5 className="font-medium text-gray-700 flex items-center gap-2">
                                                    <FiHelpCircle className="text-primary-600" /> Quizzes
                                                </h5>
                                                {courseQuizzes[course._id].map(quiz => (
                                                    <div key={quiz._id} className="bg-primary-50 rounded-xl p-4 flex items-center justify-between border border-primary-100">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{quiz.title}</div>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                                <span className="flex items-center gap-1"><FiClock size={12} /> {quiz.duration}m</span>
                                                                <span>• {quiz.questions.length} Questions</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleViewResults(quiz)}
                                                                className="text-primary-600 hover:text-primary-700 text-sm font-medium px-3 py-1 bg-white rounded-lg border border-primary-200 shadow-sm"
                                                            >
                                                                View Results
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteQuiz(quiz._id, course._id)}
                                                                className="text-red-500 hover:text-red-700 p-2"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {course.modules?.length > 0 ? (
                                            <div className="space-y-3">
                                                {course.modules.map((module, idx) => (
                                                    <div key={module._id} className="bg-gray-50 rounded-xl p-4">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full text-sm font-medium flex items-center justify-center">
                                                                    {idx + 1}
                                                                </span>
                                                                <h5 className="font-medium text-gray-800">{module.title}</h5>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedModule(module);
                                                                        setShowLessonModal(true);
                                                                    }}
                                                                    className="text-xs bg-primary-100 text-primary-600 px-2 py-1 rounded-lg hover:bg-primary-200"
                                                                >
                                                                    + Lesson
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteModule(module._id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    <FiTrash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Lessons */}
                                                        {module.lessons?.length > 0 && (
                                                            <div className="ml-8 space-y-2">
                                                                {module.lessons.map(lesson => (
                                                                    <div key={lesson._id} className="flex items-center justify-between bg-white rounded-lg p-3">
                                                                        <div className="flex items-center gap-2">
                                                                            {lesson.videoType === 'youtube' ? <FiLink size={14} className="text-red-500" /> : <FiVideo size={14} className="text-blue-500" />}
                                                                            <span className="text-sm text-gray-700">{lesson.title}</span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleDeleteLesson(lesson._id)}
                                                                            className="text-red-400 hover:text-red-600"
                                                                        >
                                                                            <FiTrash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-center py-4">No modules yet. Add your first module!</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Course Modal */}
            {
                showCourseModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">{editingCourse ? 'Edit Course' : 'Create Course'}</h2>
                                    <button onClick={() => setShowCourseModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <FiX size={24} />
                                    </button>
                                </div>
                                {error && (
                                    <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">
                                        <span>{error}</span>
                                    </div>
                                )}
                                <form onSubmit={handleCreateCourse} className="space-y-4">
                                    <div>
                                        <label className="label">Title</label>
                                        <input
                                            type="text"
                                            value={courseForm.title}
                                            onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                                            className="input"
                                            placeholder="e.g., Basic Mathematics"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Description</label>
                                        <textarea
                                            value={courseForm.description}
                                            onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                                            className="input min-h-[100px]"
                                            placeholder="Describe what students will learn..."
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="label">Category</label>
                                            <select
                                                value={courseForm.category}
                                                onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                                                className="input"
                                            >
                                                <option value="mathematics">Mathematics</option>
                                                <option value="science">Science</option>
                                                <option value="language">Language</option>
                                                <option value="computer">Computer</option>
                                                <option value="life-skills">Life Skills</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Language</label>
                                            <select
                                                value={courseForm.language}
                                                onChange={(e) => setCourseForm({ ...courseForm, language: e.target.value })}
                                                className="input"
                                            >
                                                <option value="english">English</option>
                                                <option value="hindi">Hindi</option>
                                                <option value="regional">Regional</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Difficulty</label>
                                            <select
                                                value={courseForm.difficulty}
                                                onChange={(e) => setCourseForm({ ...courseForm, difficulty: e.target.value })}
                                                className="input"
                                            >
                                                <option value="beginner">Beginner</option>
                                                <option value="intermediate">Intermediate</option>
                                                <option value="advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                                        {submitting ? (
                                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                <FiCheck size={20} />
                                                {editingCourse ? 'Save Changes' : 'Create Course'}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Module Modal */}
            {
                showModuleModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Add Module</h2>
                                    <button onClick={() => setShowModuleModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <FiX size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateModule} className="space-y-4">
                                    <div>
                                        <label className="label">Module Title</label>
                                        <input
                                            type="text"
                                            value={moduleForm.title}
                                            onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                                            className="input"
                                            placeholder="e.g., Introduction to Numbers"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Description (Optional)</label>
                                        <textarea
                                            value={moduleForm.description}
                                            onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                                            className="input min-h-[80px]"
                                            placeholder="Brief description of this module"
                                        />
                                    </div>
                                    <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                                        {submitting ? (
                                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                <FiPlus size={20} />
                                                Add Module
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Lesson Modal */}
            {
                showLessonModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Add Lesson</h2>
                                    <button onClick={() => setShowLessonModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <FiX size={24} />
                                    </button>
                                </div>
                                <form onSubmit={handleCreateLesson} className="space-y-4">
                                    <div>
                                        <label className="label">Lesson Title</label>
                                        <input
                                            type="text"
                                            value={lessonForm.title}
                                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                            className="input"
                                            placeholder="e.g., Counting from 1 to 10"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Video Type</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setLessonForm({ ...lessonForm, videoType: 'youtube' })}
                                                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 ${lessonForm.videoType === 'youtube' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                <FiLink size={20} className={lessonForm.videoType === 'youtube' ? 'text-red-500' : 'text-gray-400'} />
                                                <span className="text-sm font-medium">YouTube</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setLessonForm({ ...lessonForm, videoType: 'upload' })}
                                                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 ${lessonForm.videoType === 'upload' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                <FiUploadCloud size={20} className={lessonForm.videoType === 'upload' ? 'text-blue-500' : 'text-gray-400'} />
                                                <span className="text-sm font-medium">Upload</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setLessonForm({ ...lessonForm, videoType: 'none' })}
                                                className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 ${lessonForm.videoType === 'none' ? 'border-gray-500 bg-gray-50 text-gray-700' : 'border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                <FiFileText size={20} className={lessonForm.videoType === 'none' ? 'text-gray-500' : 'text-gray-400'} />
                                                <span className="text-sm font-medium">None</span>
                                            </button>
                                        </div>
                                    </div>
                                    {lessonForm.videoType === 'youtube' && (
                                        <div>
                                            <label className="label">YouTube URL</label>
                                            <input
                                                type="url"
                                                value={lessonForm.videoUrl}
                                                onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                                className="input"
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                required
                                            />
                                        </div>
                                    )}
                                    {lessonForm.videoType === 'upload' && (
                                        <div>
                                            <label className="label">Upload Video File</label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    onChange={(e) => setVideoFile(e.target.files[0])}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    required={!videoFile}
                                                />
                                                <div className="flex flex-col items-center">
                                                    <FiUploadCloud size={32} className="text-gray-400 mb-2" />
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {videoFile ? videoFile.name : 'Click to select video'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">MP4, WebM, MKV (Max 500MB)</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <label className="label">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            value={lessonForm.duration}
                                            onChange={(e) => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                                            className="input"
                                            min="0"
                                        />
                                    </div>
                                    <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                                        {submitting ? (
                                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                <FiPlus size={20} />
                                                Add Lesson
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Quiz Modal */}
            {
                showQuizModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Create Quiz for {selectedCourse?.title}</h2>
                                    <button onClick={() => setShowQuizModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <FiX size={24} />
                                    </button>
                                </div>

                                {error && (
                                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleCreateQuiz} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="label">Quiz Title</label>
                                            <input
                                                type="text"
                                                value={quizForm.title}
                                                onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                                                className="input"
                                                placeholder="e.g., Weekly Mathematics Test"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Duration (minutes)</label>
                                            <input
                                                type="number"
                                                value={quizForm.duration}
                                                onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })}
                                                className="input"
                                                min="1"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-700">Questions</h3>
                                            <button type="button" onClick={addQuestion} className="text-sm text-primary-600 font-medium hover:text-primary-700">
                                                + Add Question
                                            </button>
                                        </div>

                                        {quizForm.questions.map((q, qIndex) => (
                                            <div key={qIndex} className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm font-medium text-gray-500">Question {qIndex + 1}</span>
                                                    {quizForm.questions.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newQs = quizForm.questions.filter((_, i) => i !== qIndex);
                                                                setQuizForm({ ...quizForm, questions: newQs });
                                                            }}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <FiTrash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <input
                                                    type="text"
                                                    value={q.question}
                                                    onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                                    className="input bg-white"
                                                    placeholder="Enter question text"
                                                    required
                                                />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {q.options.map((opt, oIndex) => (
                                                        <div key={oIndex} className="flex items-center gap-2">
                                                            <input
                                                                type="radio"
                                                                name={`correct-${qIndex}`}
                                                                checked={q.correctOption === oIndex}
                                                                onChange={() => updateQuestion(qIndex, 'correctOption', oIndex)}
                                                                className="w-4 h-4 text-primary-600"
                                                            />
                                                            <input
                                                                type="text"
                                                                value={opt}
                                                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                                                className="input bg-white py-2 text-sm"
                                                                placeholder={`Option ${oIndex + 1}`}
                                                                required
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <button type="submit" disabled={submitting} className="btn btn-primary w-full">
                                        {submitting ? (
                                            <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                <FiCheck size={20} />
                                                Create Quiz
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Quiz Results Modal */}
            {
                showResultsModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Results: {selectedQuiz?.title}</h2>
                                    <button onClick={() => setShowResultsModal(false)} className="text-gray-400 hover:text-gray-600">
                                        <FiX size={24} />
                                    </button>
                                </div>

                                {quizResults.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">No results found yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {quizResults.map((result) => (
                                            <div key={result._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                                        {result.student?.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{result.student?.name}</h4>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(result.attemptedAt || result.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-lg font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                                                        {result.score} / {result.totalQuestions}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {result.percentage.toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default TeacherDashboard;
