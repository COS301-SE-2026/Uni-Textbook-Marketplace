// frontend/src/components/auth/login/LoginMobile.tsx
"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, ErrorText } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/auth.api"
import type { ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { getMe } from '@/lib/auth.api';

export default function LoginMobile() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [banMessage, setBanMessage] = useState<string | null>(null);
    const router = useRouter();
    const { login } = useAuth();

    const validate = () => {
        const e: Record<string, string> = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email.trim()) {
            e.email = "University email is required";
        } else if (!emailRegex.test(email)) {
            e.email = "Invalid email";
        }
        if (!password) {
            e.password = "Password is required";
        } else if (password.length < 8) {
            e.password = "Password must be at least 8 characters";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setServerError("");
        setBanMessage(null);
        if (!validate()) return;
        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            await loginUser({ email: normalizedEmail, password });

            const me = await getMe();
            login(me);
            router.push('/listings');
        } catch (err: any) {
            console.log('🔴 Login error:', err);
            console.log('🔴 Error response:', err.response);
            console.log('🔴 Status:', err.response?.status);
            console.log('🔴 Message:', err.response?.data?.message);
            
            
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || '';
            
            if (status === 403 || message.toLowerCase().includes('banned')) {
                setBanMessage(message);
                console.log('✅ Ban message set:', message);
                return;
            }
            setServerError(message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const forgotPass = () => {
        router.push('/auth/resetpassword');
    }

    const handleGoToAppeal = () => {
        console.log('🔴 Going to appeal with message:', banMessage);
        if (banMessage) {
            sessionStorage.setItem('ban_message', banMessage);
        }
        router.push('/appeal');
    };

    return (
        <main className="auth-bg min-h-screen flex items-center justify-center px-4 py-6">
            <div className="card w-full max-w-[500px] flex flex-col overflow-hidden mx-auto shadow-2xl p-0">
                {/* Top Panel - Glossy Header */}
                <div className="w-full relative overflow-hidden px-6 py-8 flex flex-col items-center justify-center" style={{
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                }}>
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)',
                    }} />
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255, 255, 255, 0.1) 100px, rgba(255, 255, 255, 0.1) 102px)',
                    }} />
                    <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-10" style={{
                        background: 'radial-gradient(circle, rgba(0, 180, 216, 0.3), transparent 70%)',
                        filter: 'blur(40px)',
                    }} />
                    <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full opacity-10" style={{
                        background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%)',
                        filter: 'blur(40px)',
                    }} />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-4 p-3 rounded-2xl" style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                        }}>
                            <Logo className="w-14 h-auto" />
                            <div className="absolute -top-px left-1/4 right-1/4 h-px" style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            }} />
                        </div>

                        <h2 className="text-center font-bold" style={{ fontSize: "1.25rem", color: '#1a1a2e', textShadow: '0 2px 20px rgba(0, 0, 0, 0.08)' }}>
                            WELCOME
                        </h2>
                        <h2 className="text-center font-bold mb-1" style={{ fontSize: "1.25rem", color: '#00B4D8', textShadow: '0 2px 20px rgba(0, 180, 216, 0.2)' }}>
                            BACK!
                        </h2>
                        <div className="relative w-16 h-px my-2">
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(0, 180, 216, 0.4), transparent)' }} />
                        </div>
                        <p className="text-center text-[#4B4F58]/80 text-sm">
                            Access your university marketplace account.
                        </p>
                    </div>
                </div>

                <div className="w-full px-6 py-8 relative" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(5px)',
                }}>
                    <div className="relative z-10">
                        <h2 style={{ fontSize: "1.25rem" }}>Login</h2>
                        <p className="text-text-subtle mt-2" style={{ fontSize: "0.9rem" }}>
                            Enter your details to access your account
                        </p>

                       
                        {banMessage && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm font-medium">⚠️ Account Banned</p>
                                <p className="text-red-600 text-sm mt-1">{banMessage}</p>
                                <Button
                                    variant="primary"
                                    className="w-full mt-3 cursor-pointer"
                                    onClick={handleGoToAppeal}
                                >
                                    Submit Appeal
                                </Button>
                            </div>
                        )}

                       
                        {!banMessage && (
                            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                                <div>
                                    <Input
                                        label="University Email"
                                        type="email"
                                        placeholder="studentNO@uni.co.za"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                                        }}
                                    />
                                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                                </div>

                                <div>
                                    <label htmlFor="password-mobile" className="form-label">Password</label>
                                    <div style={{ position: "relative", width: "100%" }}>
                                        <input
                                            id="password-mobile"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            style={{ width: "100%", paddingRight: "2.75rem" }}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                                            }}
                                            className="border border-[#dddddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] focus:shadow-[0_0_0_3px_rgba(0,180,216,0.15)] transition-all w-full box-border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => !p)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            style={{
                                                position: "absolute", top: 0, right: 0, bottom: 0,
                                                width: "2.75rem", display: "flex", alignItems: "center",
                                                justifyContent: "center", background: "transparent",
                                                border: "none", cursor: "pointer", color: "#9ca3af",
                                            }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {errors.password && <ErrorText>{errors.password}</ErrorText>}
                                </div>

                                <div className="flex justify-end -mt-2">
                                    <button
                                        type="button"
                                        className="text-sm text-primary hover:text-[#00B4D8] transition-colors cursor-pointer"
                                        style={{ background: "none", border: "none", padding: "0.25rem 0" }}
                                        onClick={forgotPass}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {serverError && <ErrorText>{serverError}</ErrorText>}

                                <div style={{ marginTop: "2rem" }}>
                                    <Button className="w-full cursor-pointer" disabled={loading} type="submit">
                                        {loading ? "Logging in…" : "Login"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}