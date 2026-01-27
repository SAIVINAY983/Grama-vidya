import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiMenu,
    FiX,
    FiHome,
    FiBook,
    FiUsers,
    FiUser,
    FiLogOut,
    FiLogIn,
    FiLayout,
    FiSettings,
    FiBell,
    FiCpu,
    FiGlobe
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { notificationAPI } from '../services/api';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const { user, logout, isAuthenticated, isAdmin, isTeacher } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Poll for notifications
    useState(() => {
        let interval;
        if (isAuthenticated) {
            const fetchNotifications = async () => {
                try {
                    const res = await notificationAPI.getMyNotifications();
                    setNotifications(res.data.notifications);
                } catch (err) {
                    console.error('Error fetching notifications:', err);
                }
            };
            fetchNotifications();
            interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        }
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (id, link) => {
        try {
            await notificationAPI.markAsRead(id);
            // Update local state
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setShowNotifications(false);
            if (link) navigate(link);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const getDashboardLink = () => {
        if (isAdmin) return '/admin';
        if (isTeacher) return '/teacher';
        return '/student';
    };

    const navLinks = [
        { name: t('navbar.home'), path: '/', icon: FiHome },
        { name: t('navbar.courses'), path: '/courses', icon: FiBook },
        { name: 'AI Assistant', path: '/chatbot', icon: FiCpu },
        { name: t('navbar.community'), path: '/community', icon: FiUsers },
    ];

    return (
        <nav className="glass sticky top-0 z-50 border-b border-gray-200">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">Gram Vidya</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
                            >
                                <link.icon size={18} />
                                {link.name}
                            </Link>
                        ))}
                        <LanguageSwitcher />
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative"
                                    >
                                        <FiBell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-700">Notifications</h3>
                                                <span className="text-xs text-gray-500">{unreadCount} New</span>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map(n => (
                                                        <div
                                                            key={n._id}
                                                            onClick={() => handleNotificationClick(n._id, n.link)}
                                                            className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${!n.isRead ? 'bg-blue-50/50' : ''}`}
                                                        >
                                                            <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                                                {n.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(n.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                                        No notifications yet
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Link
                                    to={getDashboardLink()}
                                    className="flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors font-medium"
                                >
                                    <FiLayout size={18} />
                                    {t('navbar.dashboard')}
                                </Link>
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                                        <span className="text-primary-600 font-semibold text-sm">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-gray-700 font-medium">{user?.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                        title={t('navbar.logout')}
                                    >
                                        <FiLogOut size={20} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-outline text-sm py-2">
                                    <FiLogIn size={18} />
                                    {t('navbar.login')}
                                </Link>
                                <Link to="/register" className="btn btn-primary text-sm py-2">
                                    <FiUser size={18} />
                                    {t('navbar.register')}
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium"
                                >
                                    <link.icon size={20} />
                                    {link.name}
                                </Link>
                            ))}

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to={getDashboardLink()}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-xl transition-colors font-medium"
                                    >
                                        <FiLayout size={20} />
                                        {t('navbar.dashboard')}
                                    </Link>
                                    <div className="border-t border-gray-200 mt-2 pt-2">
                                        <div className="flex items-center gap-3 px-4 py-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                <span className="text-primary-600 font-semibold">
                                                    {user?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user?.name}</p>
                                                <p className="text-sm text-gray-500 capitalize">{user?.role}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium w-full"
                                        >
                                            <FiLogOut size={20} />
                                            {t('navbar.logout')}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="border-t border-gray-200 mt-2 pt-4 flex flex-col gap-2 px-4">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="btn btn-outline w-full"
                                    >
                                        <FiLogIn size={18} />
                                        {t('navbar.login')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="btn btn-primary w-full"
                                    >
                                        <FiUser size={18} />
                                        {t('navbar.register')}
                                    </Link>
                                    <div className="mt-2">
                                        <LanguageSwitcher />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
