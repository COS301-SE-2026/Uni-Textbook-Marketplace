"use client";
import React from "react";

import Logo from "@/components/icons/Logo";
import { Button, Input, Card, ErrorText } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginDesktop() {
const {
email,
setEmail,
password,
setPassword,
showPassword,
setShowPassword,
errors,
loading,
serverError,
banMessage,
handleSubmit,
clearEmailError,
clearPasswordError,
forgotPass,
handleGoToAppeal,
} = useLoginForm();


return (
    <main className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="card w-3/5 max-w-3xl flex overflow-hidden min-w-0 shadow-2xl p-0">
            {/* Left Panel - Glossy Header */}
            <div className="card-glossy-grey w-1/2 shrink-0 flex flex-col items-center justify-center p-12 relative min-h-[500px]">
                <div
                    className="absolute top-8 right-8 w-32 h-32 rounded-full opacity-10"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(0, 180, 216, 0.3), transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />

                <div
                    className="absolute bottom-8 left-8 w-40 h-40 rounded-full opacity-10"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%)",
                        filter: "blur(60px)",
                    }}
                />

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

                        <div
                            className="absolute -top-px left-1/4 right-1/4 h-px"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                            }}
                        />
                    </div>

    return (
        <main className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">


            <Card className="card w-3/5 max-w-3xl flex overflow-hidden min-w-0 shadow-2xl p-0">
                
                
                <div className="card-glossy-grey w-1/2 shrink-0 flex flex-col items-center justify-center p-12 relative min-h-[500px]">
                    
                    
                    <div 
                        className="absolute top-8 right-8 w-32 h-32 rounded-full opacity-10"
                        style={{
                            color: "#1a1a2e",
                            textShadow:
                                "0 2px 20px rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        WELCOME
                    </h1>

                    <h1
                        className="text-3xl font-bold tracking-wide mb-6"
                        style={{
                            color: "#00B4D8",
                            textShadow:
                                "0 2px 20px rgba(0, 180, 216, 0.2)",
                        }}
                    >
                        BACK!
                    </h1>

                    <div className="relative w-24 h-px mb-6">
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(0, 180, 216, 0.4), transparent)",
                            }}
                        />
                    </div>

                    <p
                        className="text-[#4B4F58]/80 text-sm leading-relaxed max-w-xs"
                        style={{
                            textShadow:
                                "0 1px 10px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        Access your university marketplace account.
                    </p>

                    <div className="mt-8 space-y-2.3 w-full max-w-xs">
                        {[
                            {
                                id: "secure-access",
                                text: "Secure & Verified Access",
                            },
                            {
                                id: "manage-listings",
                                text: "Manage Your Listings",
                            },
                            {
                                id: "connect-buyers",
                                text: "Connect with Buyers",
                            },
                        ].map((feature) => (
                            <div
                                key={feature.id}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                                style={{
                                    background:
                                        "rgba(0, 180, 216, 0.05)",
                                    backdropFilter: "blur(5px)",
                                    border:
                                        "1px solid rgba(0, 180, 216, 0.08)",
                                }}
                            >
                                <div
                                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{
                                        background: "#00B4D8",
                                        boxShadow:
                                            "0 0 12px rgba(0, 180, 216, 0.3)",
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

                                <span className="text-[#1a1a2e]/80 text-sm font-medium">
                                    {feature.text}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-0.5"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(0, 180, 216, 0.3), transparent)",
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
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            clearEmailError();
                                        }}
                                    />

                                    {errors.email && (
                                        <ErrorText>
                                            {errors.email}
                                        </ErrorText>
                                    )}
                                </div>

                                <div>


                                    <label htmlFor="password-desktop" className="form-label">Password</label>

                                    <div style={{ position: "relative", width: "100%" }}>


                                        <input
                                            id="password-desktop"
                                            type={
                                                showPassword
                                                    ? "text"
                                                    : "password"
                                            }
                                            placeholder="Enter your password"
                                            value={password}
                                            style={{
                                                width: "100%",
                                                paddingRight: "2.75rem",
                                            }}
                                            onChange={(event) => {
                                                setPassword(
                                                    event.target.value
                                                );
                                                clearPasswordError();
                                            }}
                                            className="border border-[#dddddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] transition-all w-full box-border"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword(
                                                    (previous) =>
                                                        !previous
                                                )
                                            }
                                            aria-label={
                                                showPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
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
                                            {showPassword ? (
                                                <EyeOff size={16} />
                                            ) : (
                                                <Eye size={16} />
                                            )}
                                        </button>


                                    </div>

                                    {errors.password && (
                                        <ErrorText>
                                            {errors.password}
                                        </ErrorText>
                                    )}
                                </div>

                                <div className="flex justify-end -mt-2">


                                    <button
                                        type="button"
                                        className="text-sm text-primary hover:text-[#00B4D8] transition-colors cursor-pointer"
                                        style={{
                                            background: "none",
                                            border: "none",
                                            padding: "0.25rem 0",
                                        }}
                                        onClick={forgotPass}
                                    >
                                        Forgot Password?
                                    </button>

                                </div>

                                {serverError && (
                                    <ErrorText>{serverError}</ErrorText>
                                )}

                                <div style={{ marginTop: "3.5rem" }}>


                                    <Button 
                                        className="w-full cursor-pointer" 
                                        disabled={loading} 
                                        variant="default" 
                                        type="submit"
                                    >
                                        {loading
                                            ? "Logging in…"
                                            : "Login"}
                                    </Button>
                                </div>
                                
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    </main>
);


}
