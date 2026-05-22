import { api } from './api';

//Pattern: each function:
//Defines the shape of what it sends (input types)
//Defines the shape of what it gets back (return type)
//Delegates to api.get / api.post from api.ts

/**Types,
 * 
 * These mirrow our backend DTOs exactly
 *  
 */ 

export interface University {
  id: string;
  name: string;
  email_domain: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  university_id: string;
  faculty?: string;
}

export interface VerifyOtpData {
  email: string;
  code: string;         
}

export interface LoginData {
  email: string;
  password: string;
}

interface MessageResponse {
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'student';
}

// GET /auth/universities
export async function getUniversities(): Promise<University[]> {
  return api.get<University[]>('/auth/universities');
}

export async function registerUser(data: RegisterData): Promise<MessageResponse> {
  return api.post<MessageResponse>('/auth/register', data);
}

export async function verifyOtp(data: VerifyOtpData): Promise<{ message: string; user: AuthUser }> {
  return api.post<{ message: string; user: AuthUser }>('/auth/verify-email', data);
}

export async function resendOtp(email: string): Promise<MessageResponse> {
  return api.post<MessageResponse>('/auth/resend-otp', { email });
}

export async function loginUser(data: LoginData): Promise<MessageResponse> {
  return api.post<MessageResponse>('/auth/login', data);
}

export async function logoutUser(): Promise<MessageResponse> {
  return api.post<MessageResponse>('/auth/logout');
}

export async function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/me');
}