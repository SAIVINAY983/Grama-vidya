import { FiLoader } from 'react-icons/fi';

const Loading = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'w-5 h-5',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <FiLoader className={`${sizeClasses[size]} text-primary-600 animate-spin`} />
            {text && <p className="mt-4 text-gray-500">{text}</p>}
        </div>
    );
};

export default Loading;
