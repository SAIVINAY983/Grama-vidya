import { Link } from 'react-router-dom';
import { FiClock, FiUsers, FiBookOpen, FiPlay } from 'react-icons/fi';

const CourseCard = ({ course }) => {
    const {
        _id,
        title,
        description,
        thumbnail,
        category,
        language,
        difficulty,
        teacher,
        enrolledStudents = [],
        modules = []
    } = course;

    const getCategoryColor = (cat) => {
        const colors = {
            mathematics: 'bg-blue-100 text-blue-700',
            science: 'bg-purple-100 text-purple-700',
            language: 'bg-green-100 text-green-700',
            'social-studies': 'bg-yellow-100 text-yellow-700',
            computer: 'bg-pink-100 text-pink-700',
            'life-skills': 'bg-orange-100 text-orange-700',
            other: 'bg-gray-100 text-gray-700'
        };
        return colors[cat] || colors.other;
    };

    const getDifficultyBadge = (diff) => {
        const badges = {
            beginner: 'bg-green-500',
            intermediate: 'bg-yellow-500',
            advanced: 'bg-red-500'
        };
        return badges[diff] || badges.beginner;
    };

    return (
        <Link to={`/courses/${_id}`} className="card card-hover block group">
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100">
                {thumbnail && thumbnail !== '/images/default-course.jpg' ? (
                    <img
                        src={thumbnail}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
                        <FiBookOpen className="text-white/80" size={48} />
                    </div>
                )}
                {/* Difficulty Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium text-white ${getDifficultyBadge(difficulty)}`}>
                    {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)}
                </div>
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform">
                        <FiPlay className="text-primary-600 ml-1" size={24} />
                    </div>
                </div>
            </div>

            {/* Category & Language */}
            <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                    {category?.replace('-', ' ')}
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                    {language}
                </span>
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                {description}
            </p>

            {/* Teacher */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-sm">
                        {teacher?.name?.charAt(0).toUpperCase() || 'T'}
                    </span>
                </div>
                <span className="text-sm text-gray-600">{teacher?.name || 'Teacher'}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <FiUsers size={14} />
                    <span>{enrolledStudents?.length || 0} students</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiBookOpen size={14} />
                    <span>{modules?.length || 0} modules</span>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
