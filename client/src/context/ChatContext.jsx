import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const socketRef = useRef();

    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize socket connection
            // Use environment variable or default to local
            const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            socketRef.current = io(SOCKET_URL);

            // Join a global room or course-specific room
            // For now, everyone joins 'general'
            socketRef.current.emit('join_room', 'general');

            socketRef.current.on('receive_message', (data) => {
                setMessages((prev) => [...prev, data]);
            });

            setSocket(socketRef.current);

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                }
            };
        }
    }, [isAuthenticated, user]);

    const sendMessage = (message) => {
        if (socket && message.trim()) {
            const messageData = {
                roomId: 'general',
                message: message,
                sender: user.name,
                senderId: user._id,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            };

            socket.emit('send_message', messageData);
            setMessages((prev) => [...prev, messageData]);
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <ChatContext.Provider value={{ socket, messages, sendMessage, isOpen, toggleChat }}>
            {children}
        </ChatContext.Provider>
    );
};
