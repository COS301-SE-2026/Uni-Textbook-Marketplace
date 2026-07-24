'use client';

import { useEffect, useState } from 'react';

import MessagesDesktop from './MessagesDesktop';
import MessagesMobile from './MessagesMobile';

export default function MessagesPage() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const check = () => {
            setIsMobile(window.innerWidth < 768);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    return isMobile
        ? <MessagesMobile />
        : <MessagesDesktop />;
}