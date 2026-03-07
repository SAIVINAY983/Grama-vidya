import { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [lowDataMode, setLowDataMode] = useState(() => {
        const saved = localStorage.getItem('lowDataMode');
        return saved === 'true';
    });

    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('lowDataMode', lowDataMode);
        window.dispatchEvent(new CustomEvent('lowDataModeChange', { detail: lowDataMode }));
    }, [lowDataMode]);

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    // Apply dark mode on initial load
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleLowDataMode = () => setLowDataMode(prev => !prev);
    const toggleDarkMode = () => setDarkMode(prev => !prev);

    return (
        <SettingsContext.Provider value={{ lowDataMode, toggleLowDataMode, darkMode, toggleDarkMode }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
