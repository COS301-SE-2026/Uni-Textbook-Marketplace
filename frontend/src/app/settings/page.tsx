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
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

      <h1 className="text-[1.75rem] font-bold uppercase text-[#000f2b] dark:text-[var(--foreground)]">
        Settings
      </h1>

      {/* Account details */}

      <section className="rounded-[6px] border border-[#dddddd] dark:border-[var(--card-border)] bg-white dark:bg-[var(--card-bg)] p-6">
        <h2 className="text-[1.125rem] font-semibold text-[#000f2b] dark:text-[var(--foreground)] mb-4">
          Account Details
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>

            <label htmlFor="first_name" className="block text-sm font-medium text-[#3a3a3a] dark:text-[var(--foreground)] mb-1">
              First Name
            </label>
            <input
              id="first_name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full rounded-[4px] border border-[#dddddd] dark:border-[var(--card-border)] bg-white dark:bg-transparent px-3 py-2 text-[#3a3a3a] dark:text-[var(--foreground)] focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[rgba(0,180,216,0.15)]"
            />
          </div>


          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-[#3a3a3a] dark:text-[var(--foreground)] mb-1">
              Surname
            </label>

            <input
              id="last_name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full rounded-[4px] border border-[#dddddd] dark:border-[var(--card-border)] bg-white dark:bg-transparent px-3 py-2 text-[#3a3a3a] dark:text-[var(--foreground)] focus:outline-none focus:border-[#00B4D8] focus:ring-2 focus:ring-[rgba(0,180,216,0.15)]"
            />
          </div>



          
        <p className="text-sm text-[#4B4F58] dark:text-[var(--foreground)] mb-4">
          Deleting your account deactivates it immediately. You will be logged out and will
          no longer be able to log back in. This cannot be undone from within the app.
        </p>



        {deleteError && (
          <p className="text-sm text-[#7f1d1d] dark:text-red-400 mb-3">{deleteError}</p>
        )}

        {!confirmingDelete ? (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-[4px] border-2 border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626] hover:text-white font-semibold text-sm px-7 py-3"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">


            <p className="text-sm font-medium text-[#7f1d1d] dark:text-red-400">
              Are you sure? This will deactivate your account right away.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                disabled={deleting}
                className="rounded-[4px] bg-[#dc2626] hover:bg-[#b91c1c] disabled:opacity-60 text-white font-semibold text-sm px-7 py-3"
              >
                {deleting ? 'Deleting...' : 'Yes, delete my account'}
              </button>


              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleting}
                className="rounded-[4px] border border-[#dddddd] dark:border-[var(--card-border)] text-[#3a3a3a] dark:text-[var(--foreground)] font-semibold text-sm px-7 py-3"
              >
                Cancel
              </button>


            </div>
          </div>
        )}
      </section>


      
    </div>
  );
}