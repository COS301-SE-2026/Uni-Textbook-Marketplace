"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, Card, ErrorText } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/lib/auth.api"
import type { ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { getMe } from '@/lib/auth.api';

export default function LoginDesktop() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
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
        if (!validate()) return;
        setLoading(true);
        try {
            const normalizedEmail = email.toLowerCase().trim();
            await loginUser({ email: normalizedEmail, password });
            const me = await getMe();
            login(me);
            router.push('/listings');
        } catch (err) {
            setServerError((err as ApiError).message);
        } finally {
            setLoading(false);
        }
    };

    const forgotPass = () => {
        router.push('/auth/resetpassword');
    }

    return (
        <main className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
            <Card className="card w-3/5 max-w-3xl flex overflow-hidden min-w-0 shadow-2xl p-0">
                
                {/* LEFT PANEL - Grey Glossy */}
                <div className="card-glossy-grey w-1/2 shrink-0 flex flex-col items-center justify-center p-12 relative min-h-[500px]">
                    
                    {/* Floating Glass Orbs - Decorative */}
                    <div 
                        className="absolute top-8 right-8 w-32 h-32 rounded-full opacity-10"
                        style={{
                            background: 'radial-gradient(circle, rgba(0, 180, 216, 0.3), transparent 70%)',
                            filter: 'blur(60px)',
                        }}
                    />
                    <div 
                        className="absolute bottom-8 left-8 w-40 h-40 rounded-full opacity-10"
                        style={{
                            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%)',
                            filter: 'blur(60px)',
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                        {/* Logo Container with Glossy Effect */}
                        <div 
                            className="relative mb-6 p-4 rounded-2xl"
                            style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                            }}
                        >
                            <Logo className="w-20 h-auto" />
                            
                            {/* Glossy Highlight on Logo Container */}
                            <div 
                                className="absolute -top-px left-1/4 right-1/4 h-px"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                }}
                            />
                        </div>

                        {/* Brand Name */}
                        <h1 
                            className="text-3xl font-bold tracking-wide mb-2"
                            style={{
                                color: '#1a1a2e',
                                textShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            WELCOME
                        </h1>
                        <h1 
                            className="text-3xl font-bold tracking-wide mb-6"
                            style={{
                                color: '#00B4D8',
                                textShadow: '0 2px 20px rgba(0, 180, 216, 0.2)',
                            }}
                        >
                            BACK!
                        </h1>

                        {/* Divider with Glossy Effect */}
                        <div className="relative w-24 h-px mb-6">
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(0, 180, 216, 0.4), transparent)',
                                }}
                            />
                        </div>
                        
                        <p 
                            className="text-[#4B4F58]/80 text-sm leading-relaxed max-w-xs"
                            style={{
                                textShadow: '0 1px 10px rgba(0, 0, 0, 0.05)',
                            }}
                        >
                            Access your university marketplace account.
                        </p>

                        {/* Features List without Emojis */}
                        <div className="mt-8 space-y-2.3 w-full max-w-xs">
                            {[
                                { text: 'Secure & Verified Access' },
                                { text: 'Manage Your Listings' },
                                { text: 'Connect with Buyers' },
                            ].map((feature, index) => (
                                <div 
                                    key={index}
                                    className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                                    style={{
                                        background: 'rgba(0, 180, 216, 0.05)',
                                        backdropFilter: 'blur(5px)',
                                        border: '1px solid rgba(0, 180, 216, 0.08)',
                                    }}
                                >
                                    <div 
                                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                        style={{
                                            background: '#00B4D8',
                                            boxShadow: '0 0 12px rgba(0, 180, 216, 0.3)',
                                        }}
                                    />
                                    <span className="text-[#1a1a2e]/80 text-sm font-medium">
                                        {feature.text}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Accent */}
                        <div 
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-0.5"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(0, 180, 216, 0.3), transparent)',
                            }}
                        />
                    </div>
                </div>

                {/* RIGHT PANEL - Glossy */}
                <div className="w-1/2 flex items-center justify-center min-w-0 overflow-x-hidden overflow-y-auto py-10 relative" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(5px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                    {/* Subtle Glossy Overlay for Right Panel */}
                    <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at 30% 20%, rgba(0, 180, 216, 0.02), transparent 50%)',
                        }}
                    />
                    
                    <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem", boxSizing: "border-box", position: "relative", zIndex: 1 }}>
                        <div>
                            <h2>Login</h2>
                            <p className="text-text-subtle mt-2">
                                Enter your details to access your account
                            </p>
                            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
                                <div>
                                    <Input
                                        label="University Email"
                                        type="email"
                                        placeholder="you@university.ac.za"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                                        }}
                                    />
                                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                                </div>
                                <div>
                                    <label htmlFor="password-desktop" className="form-label">Password</label>
                                    <div style={{ position: "relative", width: "100%" }}>
                                        <input
                                            id="password-desktop"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            style={{ width: "100%", paddingRight: "2.75rem" }}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                                            }}
                                            className="border border-[#dddddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] transition-all w-full box-border"
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

                                {/* Forgot Password - Directly beneath password input */}
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

                                {/* Login Button - Moved down with spacing */}
                                <div style={{ marginTop: "3.5rem" }}>
                                    <Button 
                                        className="w-full cursor-pointer" 
                                        disabled={loading} 
                                        variant="default" 
                                        type="submit"
                                    >
                                        {loading ? "Logging in…" : "Login"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

            </Card>
        </main>
    );
}