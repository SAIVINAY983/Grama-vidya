import { useState } from 'react';
import { FiPlay, FiMaximize, FiVolume2 } from 'react-icons/fi';

const VideoPlayer = ({ videoType, videoUrl, youtubeId, title }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // Extract YouTube ID from URL if not provided
    const getYoutubeId = () => {
        if (youtubeId) return youtubeId;
        if (!videoUrl) return null;

        const match = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    };

    const ytId = getYoutubeId();

    if (videoType === 'youtube' && ytId) {
        return (
            <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
                {!isPlaying ? (
                    <div
                        className="absolute inset-0 cursor-pointer group"
                        onClick={() => setIsPlaying(true)}
                    >
                        {/* Thumbnail */}
                        <img
                            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                            alt={title || 'Video thumbnail'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <button className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                                <FiPlay className="text-white ml-1" size={32} />
                            </button>
                        </div>
                        {/* Title */}
                        {title && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white font-medium truncate">{title}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex flex-col">
                        <iframe
                            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                            title={title || 'YouTube video'}
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full flex-1"
                        />
                        <a
                            href={`https://www.youtube.com/watch?v=${ytId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:text-blue-700 text-center py-1 block bg-gray-50"
                        >
                            Trouble playing? Watch on YouTube
                        </a>
                    </div>
                )}
            </div>
        );
    }

    if (videoType === 'upload' && videoUrl) {
        return (
            <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden">
                <video
                    src={videoUrl}
                    controls
                    className="w-full h-full"
                    poster=""
                    preload="metadata"
                >
                    Your browser does not support the video tag.
                </video>
            </div>
        );
    }

    // No video placeholder
    return (
        <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            <div className="text-center text-gray-400">
                <FiPlay size={48} className="mx-auto mb-2 opacity-50" />
                <p>No video available</p>
            </div>
        </div>
    );
};

export default VideoPlayer;
