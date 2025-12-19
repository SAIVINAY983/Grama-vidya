import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Loading from '../components/Loading';
import { FiClock, FiCheck, FiAlertCircle } from 'react-icons/fi';

const QuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await quizAPI.getOne(id);
                setQuiz(res.data.quiz);
                setTimeLeft(res.data.quiz.duration * 60);
            } catch (err) {
                console.error('Error fetching quiz:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (!submitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, submitted]);

    const handleOptionSelect = (optionIndex) => {
        setAnswers({ ...answers, [currentQuestion]: optionIndex });
    };

    const handleSubmit = async () => {
        try {
            const res = await quizAPI.submit(id, answers);
            const { score, totalQuestions, percentage, passed } = res.data.result;

            setScore(score);
            setSubmitted(true);
            // Optionally store result details for display
        } catch (error) {
            console.error('Error submitting quiz:', error);
            // Handle error (show alert etc)
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <Loading />;
    if (!quiz) return <div className="text-center py-20">Quiz not found</div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <div className="container-custom py-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 flex justify-between items-center sticky top-20 z-10">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
                            <p className="text-gray-500 text-sm">Question {currentQuestion + 1} of {quiz.questions.length}</p>
                        </div>
                        {!submitted && (
                            <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary-600'}`}>
                                <FiClock />
                                {formatTime(timeLeft)}
                            </div>
                        )}
                    </div>

                    {!submitted ? (
                        /* Question Card */
                        <div className="bg-white rounded-2xl p-8 shadow-sm">
                            <h2 className="text-xl font-medium text-gray-900 mb-6">
                                {quiz.questions[currentQuestion].question}
                            </h2>

                            <div className="space-y-3 mb-8">
                                {quiz.questions[currentQuestion].options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(idx)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQuestion] === idx
                                            ? 'border-primary-500 bg-primary-50 text-primary-900'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="font-semibold text-gray-400 mr-3">{String.fromCharCode(65 + idx)}.</span>
                                        {option}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                    disabled={currentQuestion === 0}
                                    className="btn btn-outline"
                                >
                                    Previous
                                </button>
                                {currentQuestion === quiz.questions.length - 1 ? (
                                    <button
                                        onClick={handleSubmit}
                                        className="btn btn-primary bg-green-600 hover:bg-green-700 border-green-600"
                                    >
                                        Submit Quiz
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
                                        className="btn btn-primary"
                                    >
                                        Next
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Results Card */
                        <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiCheck size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Completed!</h2>
                            <p className="text-gray-500 mb-8">You have successfully submitted the quiz.</p>

                            <div className="flex justify-center gap-8 mb-8">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-primary-600">{score}</div>
                                    <div className="text-sm text-gray-500">Correct</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-gray-900">{quiz.questions.length}</div>
                                    <div className="text-sm text-gray-500">Total Questions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-secondary-600">
                                        {Math.round((score / quiz.questions.length) * 100)}%
                                    </div>
                                    <div className="text-sm text-gray-500">Score</div>
                                </div>
                            </div>

                            <button onClick={() => navigate(-1)} className="btn btn-primary">
                                Back to Course
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizPage;
