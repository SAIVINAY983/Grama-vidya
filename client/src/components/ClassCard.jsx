import { FiCalendar, FiClock, FiVideo, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { format } from 'date-fns';

const ClassCard = ({ videoClass, isTeacher, onEdit, onDelete }) => {
    const { title, description, meetLink, startTime, duration, teacher, course, status } = videoClass;

    const isLive = status === 'live' || (new Date(startTime) <= new Date() && new Date(startTime).getTime() + duration * 60000 > new Date().getTime());

    return (
        <div className={`card overflow-hidden border-l-4 ${isLive ? 'border-red-500 bg-red-50/30' : 'border-primary-500'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isLive ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-primary-100 text-primary-600'}`}>
                            {isLive ? 'Live Now' : status}
                        </span>
                        {course && (
                            <span className="text-xs text-gray-500 font-medium">
                                - {course.title}
                            </span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">{description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <FiCalendar className="text-primary-500" />
                            {format(new Date(startTime), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <FiClock className="text-primary-500" />
                            {format(new Date(startTime), 'hh:mm a')} ({duration} min)
                        </div>
                        {!isTeacher && teacher && (
                            <div className="flex items-center gap-1.5">
                                <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-600">
                                    {teacher.name?.charAt(0)}
                                </div>
                                {teacher.name}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isTeacher ? (
                        <>
                            <button
                                onClick={() => onEdit(videoClass)}
                                className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                                title="Edit Class"
                            >
                                <FiEdit2 size={18} />
                            </button>
                            <button
                                onClick={() => onDelete(videoClass._id)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                title="Delete Class"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </>
                    ) : null}

                    <a
                        href={meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn ${isLive ? 'btn-primary' : 'btn-outline'} flex items-center gap-2 py-2 px-6`}
                    >
                        <FiVideo size={18} />
                        Join Class
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ClassCard;
