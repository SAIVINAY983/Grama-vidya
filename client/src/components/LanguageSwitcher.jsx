import { useTranslation } from 'react-i18next';
import { FiGlobe } from 'react-icons/fi';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी (Hindi)' },
        { code: 'te', label: 'తెలుగు (Telugu)' },
    ];

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 text-gray-600 hover:text-primary-600 font-medium px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <FiGlobe size={20} />
                <span>{languages.find(l => l.code === i18n.language)?.label || 'Language'}</span>
            </button>

            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 p-2 hidden group-hover:block z-50">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${i18n.language === lang.code
                                ? 'bg-primary-50 text-primary-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {lang.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default LanguageSwitcher;
