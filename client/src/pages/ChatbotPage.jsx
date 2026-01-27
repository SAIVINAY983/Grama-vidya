import Chatbot from '../components/Chatbot';
import { FiInfo, FiCpu, FiMessageCircle, FiBookOpen } from 'react-icons/fi';

const ChatbotPage = () => {
    return (
        <div className="bg-gray-50 min-h-[calc(100-64px)] py-12">
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Intro & Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-6">
                                <FiCpu size={32} />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                AI Assistant
                            </h1>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Get instant help with your courses, quick answers to your questions, and personalized learning support. Our AI is trained to help you excel in your studies.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                                        <FiMessageCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Instant Chat</h4>
                                        <p className="text-sm text-gray-500">Real-time answers to your queries</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center shrink-0">
                                        <FiBookOpen size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Course Help</h4>
                                        <p className="text-sm text-gray-500">Clarify complex topics easily</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary-600 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-2">Need More Help?</h3>
                                <p className="text-primary-100 text-sm mb-6">
                                    You can also reach out to our community forums for peer support.
                                </p>
                                <button className="w-full py-3 bg-white text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors">
                                    Go to Community
                                </button>
                            </div>
                            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>

                    {/* Right Column - Chatbot Component */}
                    <div className="lg:col-span-2">
                        <Chatbot />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPage;
