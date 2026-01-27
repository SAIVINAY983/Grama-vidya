import { Link } from 'react-router-dom';
import {
    FiBook,
    FiDownload,
    FiUsers,
    FiMonitor,
    FiWifi,
    FiGlobe,
    FiPlay,
    FiArrowRight
} from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const LandingPage = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: FiWifi,
            title: 'Low Bandwidth',
            description: 'Optimized for slow internet connections. Learn even with 2G network.',
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: FiDownload,
            title: 'Offline Access',
            description: 'Download PDF notes and study materials for offline learning.',
            color: 'bg-green-100 text-green-600'
        },
        {
            icon: FiMonitor,
            title: 'Video Lessons',
            description: 'Watch YouTube videos or uploaded content in your own language.',
            color: 'bg-purple-100 text-purple-600'
        },
        {
            icon: FiUsers,
            title: 'Community Learning',
            description: 'Join discussions, ask questions, and learn from peers.',
            color: 'bg-orange-100 text-orange-600'
        },
        {
            icon: FiGlobe,
            title: 'Multiple Languages',
            description: 'Content available in English, Hindi, and regional languages.',
            color: 'bg-pink-100 text-pink-600'
        },
        {
            icon: FiBook,
            title: 'Quality Content',
            description: 'Curated courses by experienced teachers for rural students.',
            color: 'bg-teal-100 text-teal-600'
        }
    ];

    const stats = [
        { value: '1000+', label: 'Students' },
        { value: '50+', label: 'Courses' },
        { value: '100+', label: 'Teachers' },
        { value: '10+', label: 'Languages' }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container-custom relative z-10 py-20 md:py-32">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg px-4 py-2 rounded-full mb-6">
                            <span className="w-2 h-2 bg-secondary-400 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium">{t('landing.heroTitle')}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Quality Education for{' '}
                            <span className="text-secondary-400">Everyone</span>,{' '}
                            Everywhere
                        </h1>

                        <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                            {t('landing.heroSubtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register" className="btn bg-white text-primary-700 hover:bg-gray-100 hover:shadow-xl w-full sm:w-auto">
                                <FiPlay size={20} />
                                {t('landing.startLearning')}
                            </Link>
                            <Link to="/courses" className="btn bg-white/10 backdrop-blur text-white border border-white/20 hover:bg-white/20 w-full sm:w-auto">
                                <FiBook size={20} />
                                {t('landing.browseCourses')}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 50L48 45.7C96 41.3 192 32.7 288 30.5C384 28.3 480 32.7 576 39.2C672 45.7 768 54.3 864 54.2C960 54 1056 45 1152 41.5C1248 38 1344 40 1392 41L1440 42V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="#f9fafb" />
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="bg-gray-50 py-8">
                <div className="container-custom">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">{stat.value}</div>
                                <div className="text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section bg-gray-50">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Why Choose <span className="gradient-text">Gram Vidya?</span>
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We understand the challenges of rural education. Our platform is built from the ground up
                            to work for you, no matter where you are.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className="card card-hover">
                                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section bg-white">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Start Learning in <span className="gradient-text">3 Simple Steps</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                            <h3 className="text-xl font-semibold mb-2">Create Account</h3>
                            <p className="text-gray-500">Sign up for free as a student or teacher. No credit card required.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-secondary-100 text-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                            <h3 className="text-xl font-semibold mb-2">Choose Courses</h3>
                            <p className="text-gray-500">Browse courses by category, language, or difficulty level.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                            <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
                            <p className="text-gray-500">Watch videos, download notes, track progress, and earn certificates.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section bg-gradient-to-r from-primary-600 to-primary-800 text-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to Transform Your Learning?
                    </h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Join thousands of students from rural India who are already learning on Gram Vidya.
                    </p>
                    <Link to="/register" className="btn bg-white text-primary-700 hover:bg-gray-100 hover:shadow-xl">
                        Get Started for Free
                        <FiArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
