'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
    
    const [theme, setTheme] = useState<'light' | 'dark'>(() =>{
        if(typeof window === 'undefined') return 'light';
        const stored = window.localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return stored ?? (prefersDark ? 'dark' : 'light');
    });

    const [mounted, setMounted] = useState(false);
    

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        window.localStorage.setItem('theme', theme);
    }, [theme]);

    if (!mounted) {
        return <div className="w-9 h-9"/>;
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            aria-label="Toggle theme"
            >
                {theme === 'dark' ? (
                    <Sun size={20} className="text-yellow-400" />
                ) : (
                        <Moon size={20} className="text-gray-700" />
                )}
        </button>
    );
}