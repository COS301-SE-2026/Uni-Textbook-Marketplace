'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';
import { useEffect, useState } from 'react';

const PUBLIC_ROUTES = [
    '/', 
    '/auth/login', 
    '/auth/register', 
    '/auth/resetpassword', 
    '/auth/forgot-password', 
    '/auth/verify-email',
    '/appeal', 
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);

    const isPublicRoute = PUBLIC_ROUTES.some(route => {
        if (route === '/') return pathname === '/';
        return pathname?.startsWith(route);
    });

    
    const isAppealPage = pathname?.startsWith('/appeal');

    useEffect(() => {
        const id = requestAnimationFrame(() => {
            setMounted(true);
        });
        return () => cancelAnimationFrame(id);
    }, []);

    
   useEffect(() => {
        if (!isLoading && user?.is_banned && !isAppealPage) {
            router.push('/appeal');
        }
    }, [user, isLoading, router, isAppealPage]);

    if (!mounted) return null;

    const handleClose = () => {
        router.push('/');
    };

    if (isLoading) return null;

   
    if (isPublicRoute) {
        return <>{children}</>;
    }

    if (!isAuthenticated) {
        return (
            <Modal isOpen={true} title="Access Restricted" onClose={handleClose}>
                <p>You need to be logged in to access this page.</p>
                <p>Please login or register to continue.</p>
            </Modal>
        );
    }

    if (user?.is_banned) {
        return null;
    }

    return <>{children}</>;
}