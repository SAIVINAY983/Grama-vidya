import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import { authAPI } from '../services/api';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState('');
    

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success) {
            const role = result.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'teacher') navigate('/teacher');
            else navigate('/student');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    

    // Demo credentials for quick login
    const demoCredentials = [
        { role: 'Student', email: 'amit@gramvidya.com', password: 'student123' },
        { role: 'Teacher', email: 'priya@gramvidya.com', password: 'teacher123' },
        { role: 'Admin', email: 'admin@gramvidya.com', password: 'admin123' }
    ];

    const handleDemoLogin = (email, password) => {
        setFormData({ email, password });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-2xl">G</span>
                        </div>
                        <span className="font-bold text-2xl text-gray-900">Gram Vidya</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-6">Welcome Back!</h1>
                    <p className="text-gray-500 mt-2">Sign in to continue your learning journey</p>
                </div>

                {/* Login Form */}
                <div className="card">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6">
                            <FiAlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                        <>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="label">Email Address</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="input pl-12"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Password</label>
                                    <div className="relative">
                                        <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="input pl-12"
                                            placeholder="Enter your password"
                                            required
                                        />
                                    </div>
                                    <div className="text-right mt-2">
                                        <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                            Forgot password?
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? (
                                        <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        <>
                                            <FiLogIn size={20} />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-gray-500">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                                        Sign Up
                                    </Link>
                                </p>
                            </div>
                        </>

                    {/* Forgot Password Modal */}
                    {showForgotModal && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-2xl max-w-md w-full">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Forgot Password</h3>
                                        <button onClick={() => { setShowForgotModal(false); setForgotMessage(''); setForgotEmail(''); }} className="text-gray-400 hover:text-gray-600">
                                            Close
                                        </button>
                                    </div>

                                    {forgotMessage ? (
                                        <div className="p-4 bg-green-50 text-green-700 rounded-md">{forgotMessage}</div>
                                    ) : (
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            setForgotLoading(true);
                                            setForgotMessage('');
                                            try {
                                                await authAPI.forgotPassword({ email: forgotEmail });
                                                setForgotMessage('If an account with that email exists, a reset link has been sent.');
                                            } catch (err) {
                                                setForgotMessage(err.response?.data?.message || 'Unable to send reset email. Please try again later.');
                                            } finally {
                                                setForgotLoading(false);
                                            }
                                        }} className="space-y-4">
                                            <div>
                                                <label className="label">Email Address</label>
                                                <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required className="input" />
                                            </div>
                                            <button type="submit" disabled={forgotLoading} className="btn btn-primary w-full">
                                                {forgotLoading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Send Reset Link'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Demo Credentials */}
                    <div className="mt-6 card bg-gray-50 border border-gray-200">
                        <p className="text-sm text-gray-500 mb-3 font-medium">Demo Accounts (Click to fill):</p>
                        <div className="space-y-2">
                            {demoCredentials.map((demo) => (
                                <button
                                    key={demo.role}
                                    onClick={() => handleDemoLogin(demo.email, demo.password)}
                                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition-colors text-sm"
                                >
                                    <span className="font-medium text-gray-700">{demo.role}:</span>{' '}
                                    <span className="text-gray-500">{demo.email}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
