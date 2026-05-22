'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const showModal = !isLoading && !isAuthenticated  
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

if (!mounted) return null;
    const handleClose = () => {
        router.push('/');
    };

    if (isLoading) return null;

    if (!isAuthenticated) {
        return (
            <Modal isOpen={showModal} title="Access Restricted" onClose={handleClose}>
                <p>You need to be logged in to access this page.</p>
                <p>Please login or register to continue.</p>
            </Modal>
        )
    }

    return <>{children}</>;
}