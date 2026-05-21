'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Modal from '@/components/ui/Modal';

export default function AdminRoute(
    { children }: Readonly<{ children: React.ReactNode }>
) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const showModal = !isLoading && (!user || user.role !== 'admin');

    const handleClose = () => {
        router.push('/listings');
    };

    if (isLoading) return null;

    if (!user || user.role !== 'admin') {
        return (
            <Modal isOpen={showModal} title="Access Restricted" onClose={handleClose}>
                <p>You need admin privileges to access this page.</p>
            </Modal>
        );
    }

    return <>{children}</>;
}