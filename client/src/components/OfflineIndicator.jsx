import { useState, useEffect } from 'react';
import { FiWifiOff, FiX } from 'react-icons/fi';

const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setDismissed(false); // re-show if they come back online then go offline again
        };
        const handleOffline = () => {
            setIsOnline(false);
            setDismissed(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline || dismissed) return null;

    return (
        <div className="fixed top-16 left-0 right-0 z-50 animate-slide-up">
            <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <FiWifiOff size={16} />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">You are offline</p>
                        <p className="text-xs text-white/80">
                            Showing cached content. Some features may not work until reconnected.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 ml-4"
                    aria-label="Dismiss"
                >
                    <FiX size={18} />
                </button>
            </div>
        </div>
    );
};

export default OfflineIndicator;
