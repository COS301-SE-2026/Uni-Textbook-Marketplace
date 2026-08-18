'use client';

import { useEffect, useState } from 'react';

import MessagesDesktop from './MessagesDesktop';
import MessagesMobile from './MessagesMobile';

export default function MessagesPage() {

    const [mobile, setMobile] = useState(false);

    useEffect(() => {

        const resize = () =>
            setMobile(window.innerWidth < 768);

        resize();

        window.addEventListener('resize', resize);

        return () =>
            window.removeEventListener('resize', resize);

    }, []);

    return mobile
        ? <MessagesMobile />
        : <MessagesDesktop />;
}