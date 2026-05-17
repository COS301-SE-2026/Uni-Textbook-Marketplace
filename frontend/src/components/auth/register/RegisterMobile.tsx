"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, ErrorText } from "@/components/ui";
import { Eye, EyeOff, Check } from "lucide-react";

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
        <div className="flex items-center mb-6">
            {steps.map((label, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isActive = stepNum === currentStep;

                return (
                    <React.Fragment key={stepNum}>
                        <div className="flex flex-col items-center">
                            <div
                                style={{
                                    width: "2rem",
                                    height: "2rem",
                                    borderRadius: "50%",
                                    border: isCompleted || isActive ? "2.5px solid #00B4D8" : "2.5px solid #9ca3af",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: isCompleted || isActive ? "#00B4D8" : "#9ca3af",
                                    fontWeight: 700,
                                    fontSize: "0.8rem",
                                    flexShrink: 0,
                                }}
                            >
                                {isCompleted ? <Check size={13} strokeWidth={3} /> : stepNum}
                            </div>
                            <span
                                style={{
                                    fontSize: "0.55rem",
                                    marginTop: "0.25rem",
                                    color: isCompleted || isActive ? "#00B4D8" : "#9ca3af",
                                    fontWeight: isActive ? 700 : 500,
                                    textAlign: "center",
                                    whiteSpace: "pre-line",
                                    lineHeight: 1.2,
                                    width: "3.5rem",
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
                                    margin: "0 0.15rem",
                                    marginBottom: "1.3rem",
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
        pasted.split("").forEach((char, i) => { next[i] = char; });
        onChange(next);
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs[focusIndex].current?.focus();
    };

    return (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
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
                        width: "2.75rem",
                        height: "3rem",
                        textAlign: "center",
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        border: digit ? "2px solid #00B4D8" : "2px solid #dddddd",
                        borderRadius: "0.5rem",
                        outline: "none",
                        transition: "border-color 0.15s",
                        color: "#000f2b",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#00B4D8")}
                    onBlur={(e) => (e.target.style.borderColor = digit ? "#00B4D8" : "#dddddd")}
                />
            ))}
        </div>
    );
}

//  Main Component 

export default function RegisterMobile() {
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
        if (otpTimer <= 0) { setTimerActive(false); return; }
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
            // TODO: call POST /auth/register to send OTP
        }

        if (step < 4) {
            setStep((s) => s + 1);
            return;
        }

        if (!validateStep4()) return;
        setLoading(true);
        try {
            await new Promise((r) => setTimeout(r, 1000));
            // TODO: redirect on success
        } catch (err: any) {
            setServerError(err.message ?? "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

}