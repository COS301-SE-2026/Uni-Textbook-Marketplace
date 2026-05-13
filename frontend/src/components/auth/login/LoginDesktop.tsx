"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, Card } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";

export default function LoginDesktop() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");

    const validate = () => {
        const e: Record<string, string> = {};
        if (!email.trim()) {
            e.email = "University email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.email = "Enter a valid email address";
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
            // TODO: replace with real API call

            // Simulated delay for demo
            await new Promise((r) => setTimeout(r, 1000));


            throw new Error("Invalid email or password");
        } catch (err: any) {
            setServerError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background-light px-4">

            <Card className="card w-4/5 max-w-xl min-h-[500px] flex overflow-hidden">

                <div className="w-1/2 border-r border-border bg-cyan-50 p-20 flex flex-col items-center justify-center">

                    <Logo className="w-20 h-auto mb-6" />

                    <h2 className="text-center">
                        Welcome back!
                    </h2>

                    <p className="text-center text-text-subtle mt-4">
                        Access your university marketplace account.
                    </p>

                </div>


                <div className="w-[480px] p-8 flex items-center justify-center">

                    <div className="max-w-md mx-auto">

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
                                <label className="form-label">Password</label>
                                <div style={{ position: "relative", width: "100%" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        style={{
                                            width: "87%",
                                            paddingRight: "2.75rem",
                                        }}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                                        }}
                                        className="border border-[#dddddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            right: 0,
                                            bottom: 0,
                                            width: "2.75rem",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "transparent",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "#9ca3af",
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
                                <a href="#" className="text-sm text-primary" style={{margin:"15px"}}>
                                    Forgot Password?
                                </a>
                            </div>

                            <Button className="w-full ">
                                Login
                            </Button>

                        </form>

                    </div>
                </div>

            </Card>
        </main>
    );
}