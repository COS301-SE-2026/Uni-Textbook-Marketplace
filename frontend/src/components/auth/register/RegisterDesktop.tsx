"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, Card, ErrorText } from "@/components/ui";
import { Eye, EyeOff } from "lucide-react";
import { Check } from "lucide-react";

//  Types 

interface FormData {
    fullName: string;
    surname: string;
    university: string;
    email: string;
    otp: string[];
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
}

//  Step Indicator 

function StepIndicator({ currentStep }: { currentStep: number }) {
    const steps = ["Personal\nDetails", "University\nEmail", "Verification", "Password"];

    return (
        <div className="flex items-center mb-8">
            {steps.map((label, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isActive = stepNum === currentStep;

                return (
                    <React.Fragment key={stepNum}>
                        <div className="flex flex-col items-center">
                            <div
                                style={{
                                    width: "2.25rem",
                                    height: "2.25rem",
                                    borderRadius: "50%",
                                    border: isCompleted || isActive ? "2.5px solid #00B4D8" : "2.5px solid #9ca3af",
                                    backgroundColor: isCompleted || isActive ? "transparent" : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: isCompleted || isActive ? "#00B4D8" : "#9ca3af",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    flexShrink: 0,
                                }}
                            >
                                {isCompleted ? <Check size={16} strokeWidth={3} /> : stepNum}
                            </div>
                            <span
                                style={{
                                    fontSize: "0.65rem",
                                    marginTop: "0.3rem",
                                    color: isCompleted || isActive ? "#00B4D8" : "#9ca3af",
                                    fontWeight: isActive ? 700 : 500,
                                    textAlign: "center",
                                    whiteSpace: "pre-line",
                                    lineHeight: 1.2,
                                    width: "4rem",
                                }}
                            >
                                {label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                style={{
                                    flex: 1,
                                    height: "2px",
                                    backgroundColor: stepNum < currentStep ? "#00B4D8" : "#d1d5db",
                                    margin: "0 0.25rem",
                                    marginBottom: "1.4rem",
                                }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

//  OTP Input 

function OtpInput({
    value,
    onChange,
}: {
    value: string[];
    onChange: (val: string[]) => void;
}) {
    const inputRefs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));

    const handleChange = (index: number, char: string) => {
        const digit = char.replace(/\D/g, "").slice(-1);
        const next = [...value];
        next[index] = digit;
        onChange(next);
        if (digit && index < 5) {
            inputRefs[index + 1].current?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !value[index] && index > 0) {
            inputRefs[index - 1].current?.focus();
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
        inputRefs[focusIndex].current?.focus();
    };

    return (
        <div style={{ display: "flex", gap: "0.6rem" }}>
            {value.map((digit, index) => (
                <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    style={{
                        width: "3rem",
                        height: "3.25rem",
                        textAlign: "center",
                        fontSize: "1.25rem",
                        fontWeight: 600,
                        border: digit ? "2px solid #00B4D8" : "2px solid #dddddd",
                        borderRadius: "0.5rem",
                        outline: "none",
                        transition: "border-color 0.15s",
                        color: "#000f2b",
                    }}
                    onFocus={(e) =>
                        (e.target.style.borderColor = "#00B4D8")
                    }
                    onBlur={(e) =>
                        (e.target.style.borderColor = digit ? "#00B4D8" : "#dddddd")
                    }
                />
            ))}
        </div>
    );
}

//  Main Component 

export default function RegisterDesktop() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>({
        fullName: "",
        surname: "",
        university: "",
        email: "",
        otp: ["", "", "", "", "", ""],
        password: "",
        confirmPassword: "",
        agreedToTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [otpTimer, setOtpTimer] = useState(59);
    const [timerActive, setTimerActive] = useState(false);

    
    React.useEffect(() => {
        if (step === 3 && !timerActive) {
            setOtpTimer(59);
            setTimerActive(true);
        }
    }, [step]);

    React.useEffect(() => {
        if (!timerActive) return;
        if (otpTimer <= 0) {
            setTimerActive(false);
            return;
        }
        const id = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
        return () => clearTimeout(id);
    }, [otpTimer, timerActive]);

    const set = (field: keyof FormData, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (!form.surname.trim()) e.surname = "Surname is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e: Record<string, string> = {};
        if (!form.university.trim()) e.university = "University name is required";
        if (!form.email.trim()) {
            e.email = "University email is required";
        } else if (!/^[^\s@]+@(tuks\.co\.za|up\.ac\.za)$/.test(form.email)) {
            e.email = "Email must end in @tuks.co.za or @up.ac.za";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep3 = () => {
        const e: Record<string, string> = {};
        if (form.otp.some((d) => !d)) e.otp = "Please enter the full 6-digit OTP";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep4 = () => {
        const e: Record<string, string> = {};
        if (!form.password) {
            e.password = "Password is required";
        } else if (form.password.length < 8) {
            e.password = "Password must be at least 8 characters";
        }
        if (!form.confirmPassword) {
            e.confirmPassword = "Please confirm your password";
        } else if (form.password !== form.confirmPassword) {
            e.confirmPassword = "Passwords do not match";
        }
        if (!form.agreedToTerms) e.terms = "You must agree to the Terms of Service";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    

    const handleNext = async () => {
        setServerError("");
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        if (step === 3 && !validateStep3()) return;

        if (step === 2) {
            
        }

        if (step < 4) {
            setStep((s) => s + 1);
            return;
        }

        
        if (!validateStep4()) return;
        setLoading(true);
        try {
            
            await new Promise((r) => setTimeout(r, 1000));
            
        } catch (err: any) {
            setServerError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = () => {
        setOtpTimer(59);
        setTimerActive(true);
        
    };

    

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <>
                        <h2>Create an account</h2>
                        <p className="text-text-subtle mt-1 mb-6">Fill in your details to get started</p>
                        <StepIndicator currentStep={step} />

                        <div className="space-y-5">
                            <div>
                                <Input
                                    label="Full Name(s)"
                                    type="text"
                                    placeholder="Enter your full name(s)"
                                    value={form.fullName}
                                    onChange={(e) => set("fullName", e.target.value)}
                                />
                                {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}
                            </div>
                            <div>
                                <Input
                                    label="Surname"
                                    type="text"
                                    placeholder="Enter your surname"
                                    value={form.surname}
                                    onChange={(e) => set("surname", e.target.value)}
                                />
                                {errors.surname && <ErrorText>{errors.surname}</ErrorText>}
                            </div>
                        </div>
                    </>
                );

            case 2:
                return (
                    <>
                        <h2>Enter university details</h2>
                        <p className="text-text-subtle mt-1 mb-6">Fill in your details to get started</p>
                        <StepIndicator currentStep={step} />

                        <div className="space-y-5">
                            <div>
                                <Input
                                    label="Name of University/Institution"
                                    type="text"
                                    placeholder="Enter the name of the University/Institution"
                                    value={form.university}
                                    onChange={(e) => set("university", e.target.value)}
                                />
                                {errors.university && <ErrorText>{errors.university}</ErrorText>}
                            </div>
                            <div>
                                <Input
                                    label="University Email"
                                    type="email"
                                    placeholder="you@university.ac.za / you@university.co.za"
                                    value={form.email}
                                    onChange={(e) => set("email", e.target.value)}
                                />
                                {errors.email && <ErrorText>{errors.email}</ErrorText>}
                            </div>
                        </div>
                    </>
                );

            case 3:
                return (
                    <>
                        <h2>OTP Verification</h2>
                        <p className="text-text-subtle mt-1 mb-6" style={{ maxWidth: "26rem" }}>
                            Please enter the OTP (One-Time-Pin) sent to your registered email to complete verification
                        </p>
                        <StepIndicator currentStep={step} />

                        <div>
                            <OtpInput value={form.otp} onChange={(val) => set("otp", val)} />
                            {errors.otp && <ErrorText>{errors.otp}</ErrorText>}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: "1rem",
                                    fontSize: "0.8rem",
                                }}
                            >
                                <span className="text-text-subtle">
                                    Remaining time:{" "}
                                    <span style={{ color: "#00B4D8", fontWeight: 600 }}>
                                        00:{String(otpTimer).padStart(2, "0")}s
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={timerActive}
                                    style={{
                                        color: timerActive ? "#9ca3af" : "#00B4D8",
                                        background: "none",
                                        border: "none",
                                        cursor: timerActive ? "default" : "pointer",
                                        fontSize: "0.8rem",
                                        fontWeight: 500,
                                    }}
                                >
                                    Resend OTP code
                                </button>
                            </div>

                            <div style={{ marginTop: "1.5rem" }}>
                                <Button className="w-full" onClick={handleNext} disabled={loading}>
                                    Verify
                                </Button>
                            </div>
                        </div>
                    </>
                );

            case 4:
                return (
                    <>
                        <h2>Password</h2>
                        <p className="text-text-subtle mt-1 mb-6">Create your password</p>
                        <StepIndicator currentStep={step} />

                        <div className="space-y-5">
                            <div>
                                <label className="form-label">Password</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create your password"
                                        value={form.password}
                                        onChange={(e) => set("password", e.target.value)}
                                        className="w-full box-border border border-[#dddddd] rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
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
                                {errors.password && <ErrorText>{errors.password}</ErrorText>}
                            </div>

                            <div>
                                <label className="form-label">Confirm Password</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        placeholder="Confirm your password"
                                        value={form.confirmPassword}
                                        onChange={(e) => set("confirmPassword", e.target.value)}
                                        className="w-full box-border border border-[#dddddd] rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((p) => !p)}
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
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
                            </div>

                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={form.agreedToTerms}
                                    onChange={(e) => set("agreedToTerms", e.target.checked)}
                                    style={{
                                        marginTop: "0.15rem",
                                        accentColor: "#00B4D8",
                                        width: "1rem",
                                        height: "1rem",
                                        flexShrink: 0,
                                        cursor: "pointer",
                                    }}
                                />
                                <label htmlFor="terms" style={{ fontSize: "0.8rem", color: "#3a3a3a", cursor: "pointer" }}>
                                    I agree to the{" "}
                                    <a href="#" className="text-primary" style={{ fontWeight: 500 }}>
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a href="#" className="text-primary" style={{ fontWeight: 500 }}>
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                            {errors.terms && <ErrorText>{errors.terms}</ErrorText>}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };
}