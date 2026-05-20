"use client";

import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, Card, ErrorText, Select } from "@/components/ui";
import { Eye, EyeOff, Check } from "lucide-react";
import { registerUser, verifyOtp, resendOtp, getUniversities, University } from "@/lib/auth.api"
import type { ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { getMe } from '@/lib/auth.api';

//  Types 

interface FormData {
    fullName: string;
    surname: string;
    university_id: string;
    university_name: string;
    email: string;
    otp: string[];
    password: string;
    confirmPassword: string;
    agreedToTerms: boolean;
}

//  Step Indicator 

function StepIndicator({ currentStep }: Readonly<{ currentStep: number }>) {
    const steps = ["Personal\nDetails", "University\nEmail", "Password", "Verification"];

    return (
        <div className="flex items-center mb-8" style={{ width: "100%" }}>
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
                                    backgroundColor: "transparent",
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
                                    maxWidth: "5.5rem",
                                }}
                            >
                                {label}
                            </span>
                        </div>

                        {index < steps.length - 1 && (
                            <div
                                style={{
                                    width: "2rem",
                                    flexShrink: 0,
                                    height: "2px",
                                    backgroundColor: stepNum < currentStep ? "#00B4D8" : "#d1d5db",
                                    margin: "0 0.15rem",
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
}: Readonly<{
    value: string[];
    onChange: (val: string[]) => void;
}>) {
    const ref0 = React.useRef<HTMLInputElement>(null);
    const ref1 = React.useRef<HTMLInputElement>(null);
    const ref2 = React.useRef<HTMLInputElement>(null);
    const ref3 = React.useRef<HTMLInputElement>(null);
    const ref4 = React.useRef<HTMLInputElement>(null);
    const ref5 = React.useRef<HTMLInputElement>(null);
    const inputRefs = [ref0, ref1, ref2, ref3, ref4, ref5];

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
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap" }}>
            {value.map((digit, index) => (
                <input
                    key={`otp-desktop-${index}`}
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

//  Dot color helper (avoids nested ternary)
function getDotColor(n: number, step: number): string {
    if (n === step) return "#ffffff";
    if (n < step) return "#00B4D8";
    return "#9ca3af";
}

//  Main Component 

export default function RegisterDesktop() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>({
        fullName: "",
        surname: "",
        university_id: "",
        university_name: "",
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
    const [universities, setUniversities] = useState<University[]>([]);
    const [selectedDomain, setSelectedDomain] = useState('');
    const router = useRouter();
    const { login } = useAuth();

    React.useEffect(() => {
        if (step === 4 && !timerActive) {
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

    const set = (field: keyof FormData, value: FormData[keyof FormData]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    React.useEffect(() => {
        getUniversities()
            .then(setUniversities)
            .catch(() => setServerError('Could not load universities. Please refresh the page'));
    }, []);

    //  Validation per step 

    const validateStep1 = () => {
        const e: Record<string, string> = {};
        if (!form.fullName.trim()) e.fullName = "Full name is required";
        if (!form.surname.trim()) e.surname = "Surname is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {

        const e: Record<string, string> = {};
        if (!form.university_id) e.university = 'Please select your university';
        if (!form.email.trim()) {
            e.email = 'University email is required';
        } else if (selectedDomain && !form.email.endsWith(`@${selectedDomain}`)) {
            e.email = `Email must end in @${selectedDomain}`;
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep3 = () => {
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

    const validateStep4 = () => {
        const e: Record<string, string> = {};
        if (form.otp.some((d) => !d)) e.otp = "Please enter the full 6-digit OTP";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    //  Navigation 

    const handleNext = async () => {
        if (loading) return;
        setServerError("");
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        if (step === 3 && !validateStep3()) return;

        if (step === 2) {
            setLoading(true);
            try {

                setStep((s) => s + 1);
            } catch (err) {
                setServerError((err as ApiError).message);
            } finally {
                setLoading(false);
            }
            return;
        }



        if (step === 3) {
            if (!validateStep3()) return;
            setLoading(true);
            try {
                await registerUser({
                    email: form.email,
                    password: form.password,
                    first_name: form.fullName,
                    last_name: form.surname,
                    university_id: form.university_id,
                });
                setStep((s) => s + 1);
            } catch (err) {
                setServerError((err as ApiError).message);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (step < 4) {
            setStep((s) => s + 1);
            return;
        }

        // Step 4 (OTP) — final submit
        if (!validateStep4()) return;
        setLoading(true);
        try {
            const result = await verifyOtp({ email: form.email, code: form.otp.join('') });
            if (result.user) login(result.user);

            router.push('/listings');
        } catch (err) {
            setServerError((err as ApiError).message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setOtpTimer(59);
        setTimerActive(true);

        try {
            await resendOtp(form.email);
        } catch (err) {
            setServerError((err as ApiError).message);
        }
    };

    //  Step content 

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
                        <p className="text-text-subtle mt-1 mb-6">
                            Select & Fill in your details to get started
                        </p>

                        <StepIndicator currentStep={step} />

                        <div className="space-y-5">

                            {/* University Select */}
                            <div>
                                <Select
                                    label="Name of University/Institution"
                                    name="university"
                                    value={form.university_id}
                                    onChange={(e) => {
                                        const selected = universities.find(
                                            (u) => u.id === e.target.value
                                        );

                                        set("university_id", e.target.value);
                                        set("university_name", selected?.name ?? "");
                                        setSelectedDomain(selected?.email_domain ?? "");
                                    }}
                                >
                                    <option value="">Select your university</option>

                                    {universities.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name}
                                        </option>
                                    ))}
                                </Select>

                                {errors.university && (
                                    <ErrorText>{errors.university}</ErrorText>
                                )}
                            </div>

                            {/* University Email */}
                            <div>
                                <Input
                                    label="University Email"
                                    type="email"
                                    placeholder="@university.email"
                                    value={form.email}
                                    onChange={(e) => set("email", e.target.value)}
                                />

                                {errors.email && (
                                    <ErrorText>{errors.email}</ErrorText>
                                )}


                                {selectedDomain && (
                                    <p
                                        className="mt-1 text-xs text-[#00B4D8]"
                                    >
                                        Your email should end in @{selectedDomain}
                                    </p>
                                )}
                            </div>

                        </div>
                    </>
                );

            // Step 3 is now Password (previously step 4)
            case 3:
                return (
                    <>
                        <h2>Password</h2>
                        <p className="text-text-subtle mt-1 mb-6">Create your password</p>
                        <StepIndicator currentStep={step} />

                        <div className="space-y-5">
                            <div>
                                <label htmlFor="reg-password" className="form-label">Password</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        id="reg-password"
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
                                <label htmlFor="reg-confirm-password" className="form-label">Confirm Password</label>
                                <div style={{ position: "relative" }}>
                                    <input
                                        id="reg-confirm-password"
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
                                    <a href="/terms" className="text-primary" style={{ fontWeight: 500 }}>
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a href="/privacy" className="text-primary" style={{ fontWeight: 500 }}>
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>
                            {errors.terms && <ErrorText>{errors.terms}</ErrorText>}
                        </div>
                    </>
                );

            // Step 4 is now OTP Verification (previously step 3) — last step
            case 4:
                return (
                    <>
                        <h2>OTP Verification</h2>
                        <p className="text-text-subtle mt-1 mb-6" style={{ maxWidth: "100%" }}>
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
                                    {loading ? "Verifying..." : "REGISTER"}
                                </Button>
                            </div>
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    //  Layout 

    return (
        <main className="auth-bg min-h-screen flex items-center justify-center px-4 py-8">
            <Card className="card w-4/5 max-w-4xl flex overflow-hidden min-w-0">

                {/* Left panel */}
                <div className="w-2/5 shrink-0 border-r border-border bg-cyan-50 p-20 flex flex-col items-center justify-center">
                    <Logo className="w-20 h-auto mb-6" />
                    <h2 className="text-center">Join our student community</h2>
                    <p className="text-center text-text-subtle mt-4">
                        Buy, sell and swap textbooks with verified students.
                    </p>
                </div>

                {/* Right panel - wider to fit OTP inputs */}
                <div className="w-3/5 flex items-center justify-center min-w-0 overflow-x-hidden overflow-y-auto py-10">
                    <div style={{ width: "100%", maxWidth: 480, padding: "0 2rem", boxSizing: "border-box" }}>
                        {renderStepContent()}

                        {serverError && (
                            <div style={{ marginTop: "1rem" }}>
                                <ErrorText>{serverError}</ErrorText>
                            </div>
                        )}

                        {/* Bottom navigation — step dots + Next button (hidden on last OTP step since it has its own button) */}
                        {step !== 4 && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    gap: "0.6rem",
                                    marginTop: "2rem",
                                }}
                            >
                                {/* Step dots */}
                                <div style={{ display: "flex", gap: "0.4rem", marginRight: "0.5rem" }}>
                                    {[1, 2, 3, 4].map((n) => {
                                        const dotColor = getDotColor(n, step);
                                        return (
                                            <div
                                                key={n}
                                                style={{
                                                    width: "1.75rem",
                                                    height: "1.75rem",
                                                    borderRadius: "50%",
                                                    border: n <= step ? "2px solid #00B4D8" : "2px solid #9ca3af",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontSize: "0.7rem",
                                                    fontWeight: 700,
                                                    color: dotColor,
                                                    backgroundColor: n === step ? "#00B4D8" : "transparent",
                                                }}
                                            >
                                                {n}
                                            </div>
                                        );
                                    })}
                                </div>

                                <Button
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="px-8"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

            </Card>
        </main>
    );
}