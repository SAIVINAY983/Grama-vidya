import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiHeart } from 'react-icons/fi';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="font-bold text-xl text-white">Gram Vidya</span>
                        </Link>
                        <p className="text-gray-400 mb-4 max-w-md">
                            Empowering rural India through quality digital education.
                            Learn anytime, anywhere with our low-bandwidth platform designed for you.
                        </p>
                        <div className="flex flex-col gap-2 text-sm">
                            <a href="mailto:support@gramvidya.com" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                                <FiMail size={16} />
                                support@gramvidya.com
                            </a>
                            <a href="tel:+911234567890" className="flex items-center gap-2 hover:text-primary-400 transition-colors">
                                <FiPhone size={16} />
                                +91 12345 67890
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/courses" className="hover:text-primary-400 transition-colors">
                                    All Courses
                                </Link>
                            </li>
                            <li>
                                <Link to="/community" className="hover:text-primary-400 transition-colors">
                                    Community
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="hover:text-primary-400 transition-colors">
                                    Become a Teacher
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-primary-400 transition-colors">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Categories</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/courses?category=mathematics" className="hover:text-primary-400 transition-colors">
                                    Mathematics
                                </Link>
                            </li>
                            <li>
                                <Link to="/courses?category=science" className="hover:text-primary-400 transition-colors">
                                    Science
                                </Link>
                            </li>
                            <li>
                                <Link to="/courses?category=language" className="hover:text-primary-400 transition-colors">
                                    Language
                                </Link>
                            </li>
                            <li>
                                <Link to="/courses?category=computer" className="hover:text-primary-400 transition-colors">
                                    Computer Skills
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {currentYear} Gram Vidya. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                        Made with <FiHeart className="text-red-500" size={14} /> for Rural India
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
