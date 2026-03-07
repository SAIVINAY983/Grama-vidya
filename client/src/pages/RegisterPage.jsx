import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiLock, FiUserPlus, FiAlertCircle } from 'react-icons/fi';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // OTP State
    const [showOTP, setShowOTP] = useState(false);
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState('');

    const { register, verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (!/^[6789][0-9]{9}$/.test(formData.phone)) {
            setError('Please enter a valid 10-digit mobile number starting with 6-9');
            setLoading(false);
            return;
        }

        const result = await register({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: formData.role
        });

        if (result.success && result.requiresOTP) {
            setUserId(result.userId);
            setShowOTP(true);
        } else if (result.success) {
            const role = result.user.role;
            if (role === 'teacher') navigate('/teacher');
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
            if (role === 'teacher') navigate('/teacher');
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
                    <h1 className="text-2xl font-bold text-gray-900 mt-6">Create Your Account</h1>
                    <p className="text-gray-500 mt-2">Start your learning journey today</p>
                </div>

                {/* Register Form */}
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
                                    Please enter the verification code sent to your email
                                </p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-5">
                                <div>
                                    <label className="label text-center">Verification Code</label>
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
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Role Selection */}
                            <div>
                                <label className="label">I want to join as</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'student' })}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.role === 'student'
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <FiUser className="mx-auto mb-2" size={24} />
                                        <span className="font-medium">Student</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'teacher' })}
                                        className={`p-4 rounded-xl border-2 transition-all ${formData.role === 'teacher'
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <FiUserPlus className="mx-auto mb-2" size={24} />
                                        <span className="font-medium">Teacher</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="label">Full Name</label>
                                <div className="relative">
                                    <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input pl-12"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

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
                                <label className="label">Mobile Number</label>
                                <div className="relative">
                                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="input pl-12"
                                        placeholder="Enter your 10-digit mobile number"
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
                                        placeholder="Create a password (min 6 characters)"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="label">Confirm Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="input pl-12"
                                        placeholder="Confirm your password"
                                        required
                                    />
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
                                        <FiUserPlus size={20} />
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {!showOTP && (
                        <div className="mt-6 text-center">
                            <p className="text-gray-500">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
