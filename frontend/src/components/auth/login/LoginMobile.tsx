"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input } from "@/components/ui";
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
    const router = useRouter();
    const { login } = useAuth();

    const validate = () => {
        const e: Record<string, string> = {};
        if (!email.trim()) {
            e.email = "University email is required";
        } else if (!/^[^\s@]+@(tuks\.co\.za|up\.ac\.za)$/.test(email)) {
            e.email = "Email must end in @tuks.co.za or @up.ac.za";
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

    return (
        <main className="auth-bg min-h-screen flex items-center justify-center px-4 py-6">
            <div className="card w-full max-w-[900px] min-h-[500px] flex flex-col overflow-hidden mx-auto">
                <div className="w-full border-b border-border bg-cyan-50 px-6 py-8 flex flex-col items-center justify-center">
                    <Logo className="w-16 h-auto mb-6" />
                    <h2 className="text-center">Welcome back!</h2>
                    <p className="text-center text-text-subtle mt-4">
                        Access your university marketplace account.
                    </p>
                </div>
                <div className="w-full px-6 py-8 flex items-center justify-center">
                    <div className="w-full max-w-md mx-auto">
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
                                {errors.email && (
                                    <p style={{ color: "red", fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 500 }}>
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="password-mobile" className="form-label">Password</label>
                                <div style={{ position: "relative", width: "100%" }}>
                                    <input
                                        id="password-mobile"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        style={{ width: "87%", paddingRight: "2.75rem" }}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                                        }}
                                        className="border border-[#dddddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
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
                                {errors.password && (
                                    <p style={{ color: "red", fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 500 }}>
                                        {errors.password}
                                    </p>
                                )}
                            </div>
                            {serverError && (
                                <p style={{ color: "red", fontSize: "0.75rem", fontWeight: 500 }}>
                                    {serverError}
                                </p>
                            )}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm text-primary"
                                    style={{ margin: "15px", background: "none", border: "none", cursor: "pointer" }}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <Button className="w-full" disabled={loading}>
                                {loading ? "Logging in…" : "Login"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
}