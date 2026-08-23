import { api } from './api';
import type { AuthUser } from './auth.api';

export interface UpdateProfilePayload {
    first_name?: string;
    last_name?: string;
}

export interface ChangePasswordPayload {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

interface MessageResponse {
    message: string;
}

export async function updateProfile(data: UpdateProfilePayload): Promise<AuthUser> {
    return api.patch<AuthUser>('/auth/me', data);
}

export async function deleteAccount(): Promise<MessageResponse> {
    return api.delete<MessageResponse>('/auth/me');
}