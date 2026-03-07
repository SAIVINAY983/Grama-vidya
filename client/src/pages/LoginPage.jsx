import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { authAPI } from '../services/api';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState('');

    // OTP State
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const { login, verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();

    // Load saved credentials on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('gv_saved_email');
        const savedPassword = localStorage.getItem('gv_saved_password');
        if (savedEmail && savedPassword) {
            setFormData({ email: savedEmail, password: savedPassword });
            setRememberMe(true);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(formData.email, formData.password);

        if (result.success && result.requiresOTP) {
            setUserId(result.userId);
            setUserEmail(result.email);
            setShowOTP(true);
        } else if (result.success) {
            // Save or clear credentials based on Remember Me
            if (rememberMe) {
                localStorage.setItem('gv_saved_email', formData.email);
                localStorage.setItem('gv_saved_password', formData.password);
            } else {
                localStorage.removeItem('gv_saved_email');
                localStorage.removeItem('gv_saved_password');
            }
            const role = result.user.role;
            if (role === 'admin') navigate('/admin');
            else if (role === 'teacher') navigate('/teacher');
            else navigate('/student');
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await verifyOTP(userId, otp);
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

    const handleResend = async () => {
        setError('');
        const result = await resendOTP(userId);
        if (result.success) {
            alert('A new verification code has been sent to your email!');
        } else {
            setError(result.message);
        }
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

                    {showOTP ? (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiMail size={32} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Verify Your Account</h2>
                                <p className="text-gray-500 text-sm">
                                    Please enter the verification code sent to
                                    <br />
                                    <span className="font-semibold text-gray-900">{userEmail}</span>
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-5">
                                <div>
                                    <label className="label text-center">Enter Verification Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="input text-center text-2xl tracking-[0.5em] font-mono h-14"
                                        placeholder="000000"
                                        maxLength="6"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="btn btn-primary w-full"
                                >
                                    {loading ? (
                                        <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    ) : (
                                        'Verify Account'
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-2">
                                    Please enter the 6-digit code to enable the button
                                </p>
                            </form>

                            <div className="text-center mt-6">
                                <p className="text-gray-500 text-sm">
                                    Didn't receive the code?{' '}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className="text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Resend Code
                                    </button>
                                </p>
                                <button
                                    onClick={() => setShowOTP(false)}
                                    className="mt-4 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </div>
                    ) : (
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
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="input pl-12 pr-12"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        {/* Remember Me */}
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="w-4 h-4 rounded accent-primary-600 cursor-pointer"
                                            />
                                            <span className="text-sm text-gray-600">Remember me</span>
                                        </label>
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
                    )}

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
