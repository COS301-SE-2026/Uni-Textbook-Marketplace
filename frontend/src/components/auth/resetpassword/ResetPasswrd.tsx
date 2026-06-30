"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, Card, ErrorText } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { forgotPassword, verifyOtp } from "@/lib/auth.api";
import { useRouter } from "next/navigation";

function StepIndicator({ currentStep }: { currentStep: number }) {
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
                                className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm ${active || complete
                                    ? "border-cyan-500 text-cyan-500"
                                    : "border-gray-300 text-gray-400"
                                    } ${active ? "bg-cyan-500 text-white" : ""}`}
                            >
                                {complete ? "✓" : stepNum}
                            </div>

                            <span
                                className={`mt-2 text-xs text-center ${active || complete ? "text-cyan-500" : "text-gray-400"}`}
                            >
                                {label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                className={`w-8 sm:w-16 h-[2px] mx-2 ${complete ? "bg-cyan-500" : "bg-gray-300"}`}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function OtpInput({
    value,
    onChange,
}: {
    value: string[];
    onChange: (value: string[]) => void;
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

    return (
        <div className="flex justify-center gap-2 sm:gap-3">
            {value.map((digit, index) => (
                <input
                    key={index}
                    ref={refs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold border-2 rounded-lg outline-none focus:border-cyan-500"
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
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
                        <p className="text-gray-500 mb-6">Enter your email and new password</p>

                        <div className="space-y-5">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={(e) => setField("email", e.target.value)}
                            />
                            {errors.email && <ErrorText>{errors.email}</ErrorText>}

                            <label htmlFor="re-password" className="form-label">Password</label>
                            <div className="relative">
                                <input
                                    id="re-password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={(e) => setField("password", e.target.value)}
                                    className="w-full border rounded-lg px-4 py-3 pr-12"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <ErrorText>{errors.password}</ErrorText>}

                            <label htmlFor="re-confirm-password" className="form-label">Confirm Password</label>
                            <div className="relative">
                                <input
                                    id="re-confirm-password"
                                    type={showConfirm ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={(e) => setField("confirmPassword", e.target.value)}
                                    className="w-full border rounded-lg px-4 py-3 pr-12"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}

                            <Button
                                variant="primary"
                                onClick={() => void handleNext()}
                                className="w-full"
                            >
                                {loading ? "loading..." : "Next"}
                            </Button>
                        </div>
                    </>
                );

            case 2:
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Verify OTP</h2>
                        <p className="text-gray-500 mb-6">
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
                                className="w-full"
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>
                        </div>
                    </>
                );

            case 3:
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Success</h2>
                        <p className="text-gray-500 mb-6">
                            Your password has been reset successfully.
                        </p>
                        <Button
                            variant="secondary"
                            onClick={() => router.push('/auth/login')}
                            className="w-full"
                        >
                            Login
                        </Button>
                    </>
                );

            default:
                return null;
        }
    };

    const handleNext = async () => {
        if (loading) return;

        setErrors({});
        setServerError("");

        if (step === 1) {
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
                    : "Unable to reset password,Please try again";
                setServerError(message);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (step === 2) {
            if (!validateStep2()) return;

            setLoading(true);
            try {
                const otpCode = form.otp.join("");
                await verifyOtp({
                    email: form.email.trim().toLowerCase(),
                    code: otpCode
                })
                setStep(3);

            } catch (error: unknown) {
                const message = error instanceof Error
                    ? error.message
                    : "invalid otp";
                setServerError(message);
        
            } finally {
                setLoading(false);
            }
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
    }

    return (
        <main className="auth-bg min-h-screen flex items-center justify-center p-4 ">
            <Card className="max-w-3xl flex flex-col lg:flex-row overflow-hidden">
                <div className="w-full lg:w-1/2 lg:bg-cyan-50 px-6 py-10 lg:p-16 flex flex-col justify-center items-center border-b lg:border-b-0 lg:border-r">
                    <Logo className="w-20 mb-6" />
                    <h2 className="text-center text-2xl font-bold">Welcome to our student community</h2>

                    <p className="text-center text-gray-500 mt-3">
                        Secure your account by creating a new password.
                    </p>
                </div>

                <div className="w-full lg:w-1/2  flex items-center justify-center py-8">
                    <div className="w-full max-w-[420px] px-5">

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