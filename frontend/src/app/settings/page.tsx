'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateProfile, changePassword, deleteAccount } from '@/lib/settings.api';
import type { ApiError } from '@/lib/api';

export default function SettingsPage() {
  const { user, login, logout } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name ?? '');
  const [lastName, setLastName] = useState(user?.last_name ?? '');


  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');


  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [savingPassword, setSavingPassword] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  const [deleting, setDeleting] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileStatus(null);

    setSavingProfile(true);

    try {
      const updated = await updateProfile({
        first_name: firstName.trim(),

        last_name: lastName.trim(),
      });

      if (user) {
        login({ ...user, ...updated });
      }

      setProfileStatus({ type: 'success', text: 'Your details have been updated.' });
    } catch (err) {
      const message = (err as ApiError)?.message ?? 'Something went wrong.';

      setProfileStatus({ type: 'error', text: message });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    setPasswordStatus(null);

    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setCurrentPassword('');
      setNewPassword('');


      setConfirmPassword('');

      setPasswordStatus({ type: 'success', text: 'Your password has been changed.' });
    } catch (err) {
      const message = (err as ApiError)?.message ?? 'Something went wrong.';
      setPasswordStatus({ type: 'error', text: message });
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleDeleteConfirmed() {
    setDeleteError(null);

    setDeleting(true);

    try {
      await deleteAccount();
      await logout();

    } catch (err) {
      const message = (err as ApiError)?.message ?? 'Failed to delete your account.';
      setDeleteError(message);
      
      setDeleting(false);
    }
  }

  return (
    
  );
}