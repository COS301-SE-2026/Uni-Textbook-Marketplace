"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, Card, ErrorText } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { forgotPassword, verifyOtp } from "@/lib/auth.api";
import { useRouter } from "next/navigation";

function StepIndicator({ currentStep }: Readonly<{ currentStep: number }>) {

    const steps = ["Details", "Verification", "Success"];

    return (
        <div className="flex items-center justify-center mb-8">

            {steps.map((label, index) => {
                const stepNum = index + 1;
                const active = currentStep === stepNum;
                const complete = currentStep > stepNum;

                return (
                    <React.Fragment key={stepNum}>


                        <div className="flex flex-col items-center">

                            <div
                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all duration-200 ${
                                    active || complete
                                        ? "border-[#00B4D8] text-[#00B4D8]"
                                        : "border-gray-300 text-gray-400"
                                } ${active ? "bg-[#00B4D8] text-white" : ""}`}
                            >

                                {complete ? "✓" : stepNum}
                            </div>

                            <span
                                className={`mt-2 text-xs text-center transition-colors duration-200 ${
                                    active || complete ? "text-[#00B4D8]" : "text-gray-400"
                                }`}
                            >
                                {label}
                            </span>


                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={`w-8 sm:w-16 h-[2px] mx-2 transition-colors duration-200 ${
                                    complete ? "bg-[#00B4D8]" : "bg-gray-300"
                                }`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>

    );
}

const OTP_INPUT_KEYS = [
    "otp-first",
    "otp-second",
    "otp-third",
    "otp-fourth",
    "otp-fifth",
    "otp-sixth",
];

function OtpInput({
    value,
    onChange,
}: {
    readonly value: string[];

    readonly onChange: (value: string[]) => void;
}) {
    const refs = Array.from({ length: 6 }, () => React.createRef<HTMLInputElement>());

    const handleChange = (index: number, val: string) => {

        const digit = val.replace(/\D/g, "").slice(-1);

        const next = [...value];

        next[index] = digit;

        onChange(next);

        if (digit && index < 5) {
            refs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {

            refs[index - 1].current?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {

        e.preventDefault();

        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);

        const next = [...value];

        pasted.split("").forEach((char, i) => {
            next[i] = char;
        });

        onChange(next);

        const focusIndex = Math.min(pasted.length, 5);

        refs[focusIndex].current?.focus();
    };

    return (
        <div className="flex justify-center gap-2 sm:gap-3">


            {value.map((digit, index) => (
                <input
                    key={OTP_INPUT_KEYS[index]}
                    ref={refs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold border-2 rounded-lg outline-none transition-all duration-200 focus:border-[#00B4D8] focus:shadow-[0_0_0_3px_rgba(0,180,216,0.15)]"
                    style={{
                        borderColor: digit ? "#00B4D8" : "#dddddd",
                    }}
                />
            ))}
        </div>
    );
}

export default function ResetPassword() {

    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        otp: ["", "", "", "", "", ""],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [serverError, setServerError] = useState("");


    const [showPassword, setShowPassword] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const setField = (
        field: "email" | "password" | "confirmPassword",
        value: string
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const renderStepContent = () => {

        switch (step) {
            case 1:
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>



                        <p className="text-text-subtle mb-6">Enter your email and new password</p>

                        <div className="space-y-5">

                            <div>

                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={(e) => setField("email", e.target.value)}
                                />


                                {errors.email && <ErrorText>{errors.email}</ErrorText>}
                            </div>

                            <div>
                                <label htmlFor="re-password" className="form-label">Password</label>


                                <div className="relative">


                                    <input
                                        id="re-password"
                                        type={showPassword ? "text" : "password"}
                                        value={form.password}
                                        onChange={(e) => setField("password", e.target.value)}
                                        className="w-full border border-[#dddddd] rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                                        placeholder="Enter new password"
                                    />


                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00B4D8] transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>


                                </div>
                                {errors.password && <ErrorText>{errors.password}</ErrorText>}
                            </div>

                            <div>
                                <label htmlFor="re-confirm-password" className="form-label">Confirm Password</label>


                                <div className="relative">


                                    <input
                                        id="re-confirm-password"
                                        type={showConfirm ? "text" : "password"}
                                        value={form.confirmPassword}
                                        onChange={(e) => setField("confirmPassword", e.target.value)}
                                        className="w-full border border-[#dddddd] rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                                        placeholder="Confirm new password"
                                    />


                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#00B4D8] transition-colors cursor-pointer"
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>


                                </div>
                                {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
                            </div>

                            <Button
                                variant="primary"
                                onClick={() => void handleNext()}
                                className="w-full cursor-pointer"
                            >
                                {loading ? "Loading..." : "Next"}
                            </Button>

                        </div>
                    </>
                );

            case 2:
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Verify OTP</h2>

                        <p className="text-text-subtle mb-6">
                            Enter the 6-digit code sent to your email
                        </p>

                        <OtpInput
                            value={form.otp}
                            onChange={(otp) => setForm((prev) => ({ ...prev, otp }))}
                        />

                        {errors.otp && <ErrorText>{errors.otp}</ErrorText>}

                        <div className="mt-6">

                            <Button
                                variant="primary"
                                onClick={() => void handleNext()}
                                disabled={loading}
                                className="w-full cursor-pointer"
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>



                        </div>
                    </>
                );
            case 3:
                return (
                    <div className="text-center py-4">


                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">

                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">


                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>

                            </div>

                            <h2 className="text-2xl font-semibold mb-2">Success</h2>

                            <p className="text-text-subtle mb-6">
                                Your password has been reset successfully.
                            </p>

                            <Button
                                variant="primary"
                                onClick={() => router.push('/auth/login')}
                                className="w-full cursor-pointer"
                            >
                                Login
                            </Button>

                    </div>

                );

            default:
                return null;
        }
    };

    const handleStep1 = async () => {

        if (!validateStep1()) return;

        setLoading(true);

        try {
            const normalizedEmail = form.email.toLowerCase().trim();

            await forgotPassword({
                email: normalizedEmail,
                password: form.password,
            });
            setStep(2);
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : "Unable to reset password. Please try again";
            setServerError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleStep2 = async () => {


        if (!validateStep2()) return;

        setLoading(true);
        try {
            const otpCode = form.otp.join("");
            await verifyOtp({
                email: form.email.trim().toLowerCase(),
                code: otpCode
            });
            setStep(3);
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message
                : "Invalid OTP. Please try again.";
            setServerError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (loading) return;

        setErrors({});
        setServerError("");

        if (step === 1) {
            await handleStep1();
        } else if (step === 2) {
            await handleStep2();
        }
    };

    const validateStep1 = () => {
        const e: Record<string, string> = {};

        if (!form.email.trim()) {
            e.email = "Email is required";
        }

        if (!form.password) {
            e.password = "Password is required";
        } else if (form.password.length < 8) {
            e.password = "Password must be at least 8 characters";
        }

        if (form.password !== form.confirmPassword) {
            e.confirmPassword = "Passwords do not match";
        }


        setErrors(e);


        return Object.keys(e).length === 0;

    };

    const validateStep2 = () => {

        const e: Record<string, string> = {};


        if (form.otp.some((d) => !d)) {
            e.otp = "Enter all 6 digits";
        }
        setErrors(e);

        return Object.keys(e).length === 0;
    };

    return (
        <main className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">

            <Card className="card w-3/5 max-w-3xl flex overflow-hidden min-w-0 shadow-2xl p-0">
                
                
                
                <div className="card-glossy-grey w-1/2 shrink-0 flex flex-col items-center justify-center p-12 relative min-h-[450px]">
                    
                    
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
                    
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        
                        
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
                            
                            
                            <div 
                                className="absolute -top-px left-1/4 right-1/4 h-px"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                }}
                            />
                        </div>
                        
                        
                        <h1 
                            className="text-3xl font-bold tracking-wide mb-2"
                            style={{
                                color: '#1a1a2e',
                                textShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            SECURE
                        </h1>

                        <h1 
                            className="text-3xl font-bold tracking-wide mb-6"
                            style={{
                                color: '#00B4D8',
                                textShadow: '0 2px 20px rgba(0, 180, 216, 0.2)',
                            }}
                        >
                            YOUR ACCOUNT
                        </h1>
                        
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
                            Secure your account by creating a new password.
                        </p>

                        
                        <div className="mt-8 space-y-2.3 w-full max-w-xs">
                            {[
                                { text: 'Reset Your Password' },
                                { text: 'Secure Your Account' },
                                { text: 'Regain Access' },
                            ].map((feature) => (
                                <div 
                                    key={feature.text}
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
                        
                        
                        <div 
                            className="absolute bottom-12 left-1/2 -translate-x-1/2 w-32 h-0.5"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(0, 180, 216, 0.3), transparent)',
                            }}
                        />
                    </div>
                    
                </div>
                
                
                <div className="w-1/2 flex items-center justify-center min-w-0 overflow-x-hidden overflow-y-auto py-10 relative" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(5px)',
                    borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
                }}>
                    
                    <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at 30% 20%, rgba(0, 180, 216, 0.02), transparent 50%)',
                        }}
                    />
                    <div style={{ width: "100%", maxWidth: 420, padding: "0 1.5rem", boxSizing: "border-box", position: "relative", zIndex: 1 }}>
                        <StepIndicator currentStep={step} />
                        {renderStepContent()}
                        {serverError && (
                            <ErrorText className="mt-4">{serverError}</ErrorText>
                        )}
                    </div>
                    
                </div>

            </Card>
        </main>
    );
}