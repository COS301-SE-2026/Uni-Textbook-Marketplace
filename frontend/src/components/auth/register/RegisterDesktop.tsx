"use client";

import React, { useState, useRef, useEffect } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, Card, Stepper } from "@/components/ui";
import { Check, Eye, EyeOff } from "lucide-react";


function LeftPanel() {
    return (
        <div className="w-[320px] shrink-0 border-r border-border bg-cyan-50 px-14 py-30 flex flex-col items-center justify-center gap-5">
            <Logo className="w-20 h-28" />

            <h3 className="text-center font-semibold text-navy leading-snug text-lg">
                Join our student community
            </h3>
        </div>
    );
}

interface ErrorProps {
  children: React.ReactNode;
  className?: string; 
}

function ErrorText({ children, className = "" }: ErrorProps) {
  return (
    <p style={{ color: "red", fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 500 }}>
      {children}
    </p>
  );
}


function FormWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex-1 px-16 py-12 flex flex-col justify-center">
            <div className="w-full max-w-[440px] mx-auto">
                {children}
            </div>
        </div>
    );
}

function StepNav({
    current,
    total = 4,
    onJump,
    nextLabel = "Next",
    onNext,
}: {
    current: number;
    total?: number;
    nextLabel?: string;
    onJump?: (n: number) => void;
    onNext?: () => void;
}) {
    return (
        <div className="flex items-center" style={{ gap: "0.75rem", marginTop: "2rem" }}>
            {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
                <div
                    key={n}
                    onClick={() => onJump?.(n)}
                    className="flex items-center justify-center text-sm font-semibold"
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        border: n === current ? "2px solid #00B4D8" : "2px solid #d1d5db",
                        backgroundColor: n === current ? "#00B4D8" : "#ffffff",
                        color: n === current ? "#ffffff" : "#9ca3af",
                        flexShrink: 0,
                    }}
                >
                    {n}
                </div>
            ))}
            <Button className="btn-primary" onClick={onNext}>
                {nextLabel}
            </Button>
        </div>
    );
}

function Step1({ onNext }: { onNext: (data: any) => void }) {
    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!firstName.trim()) newErrors.firstName = "Full name is required";
        if (!surname.trim()) newErrors.surname = "Surname is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <FormWrapper>
            <h2 className="text-[#000f2b] text-2xl font-bold mb-6">Create an account</h2>
            <p className="text-gray-500 text-sm mb-6">Fill in your details to get started</p>

            <Stepper current={1} />

            <div className="space-y-5">
                <div>
                    <Input
                        label="Full Name(s)"
                        placeholder="Enter your full name(s)"
                        type="text"
                        value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    />
                    {errors.firstName && <ErrorText className="text-red-600 text-xs mt-1 font-medium">{errors.firstName}</ErrorText>}
                </div>
                <div>
                    <Input
                        label="Surname"
                        placeholder="Enter your surname"
                        value={surname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)}
                    />
                    {errors.surname && <ErrorText className="text-red-600 text-xs mt-1 font-medium">{errors.surname}</ErrorText>}
                </div>
            </div>
            <StepNav
                current={1}
                onNext={() => { if (validate()) onNext({ firstName, surname }); }}
            />
        </FormWrapper>
    );
}

function Step2({ onNext, onBack }: { onNext: (data: any) => void; onBack: () => void }) {
    const [university, setUniversity] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!university.trim()) newErrors.university = "University is required";
        if (!email.trim()) newErrors.email = "University email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <FormWrapper>
            <h2 className="text-[#000f2b] text-2xl font-bold">University details</h2>
            <p className="text-gray-500 text-sm mt-1 mb-8">Tell us where you study</p>
            <Stepper current={2} />
            <div className="space-y-5">
                <div>
                    <Input
                        label="University"
                        placeholder="Search institution..."
                        value={university}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUniversity(e.target.value)}
                    />
                    {errors.university && <ErrorText className="text-red-600 text-xs mt-1 font-medium">{errors.university}</ErrorText>}
                </div>
                <div>
                    <Input
                        label="University Email"
                        placeholder="you@university.ac.za"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                    {errors.email && <ErrorText className="text-red-600 text-xs mt-1 font-medium">{errors.email}</ErrorText>}
                </div>
            </div>
            <div className="flex items-center justify-between mt-8">
                <button onClick={onBack} className="btn-secondary px-6 text-sm " style={{ marginTop: '38px' }}>Back</button>
                <StepNav
                    current={2}
                    onNext={() => { if (validate()) onNext({ university, email }); }}
                />
            </div>
        </FormWrapper>
    );
}

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [seconds, setSeconds] = useState(90);

    useEffect(() => {
        if (seconds <= 0) return;
        const t = setTimeout(() => setSeconds(s => s - 1), 1000);
        return () => clearTimeout(t);
    }, [seconds]);


    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const fmt = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

    const validate = () => {
        if (otp.some((digit) => digit === "")) {
            setError("Please enter all 6 digits");
            return false;
        }
        setError("");
        return true;
    };

    return (
        <FormWrapper>
            <h2 className="text-[#000f2b] text-2xl font-bold">OTP Verification</h2>
            <p className="text-gray-500 text-sm mt-1 mb-8">Enter the code sent to your email</p>
            <Stepper current={3} />

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                Please enter the OTP (One-Time-Pin) sent to your registered email to complete verification.
            </p>

            <div className="flex " style={{ marginBottom: "30px" }} >
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        ref={(el) => { inputRefs.current[i] = el; }}
                        value={digit}
                        onChange={(e) => handleChange(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        className={`w-11 h-13 border-2 rounded-lg text-center text-xl font-bold focus:outline-none transition-all
                            ${digit ? "border-[#00B4D8] bg-[#e8f8fc]" : "border-[#dddddd] bg-white"}
                            focus:border-[#00B4D8]`}
                        style={{ height: "52px" }}
                        maxLength={1}
                        inputMode="numeric"
                    />
                ))}
            </div>

            <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-text-subtle">
                    Remaining time: <span className={`font-bold ${seconds < 30 ? "text-red-500" : "text-primary"}`}>{fmt}</span>
                </span>
                <Button className="font-semibold">Resend OTP code</Button>
            </div>

            {error && <ErrorText className="text-red-500 text-xs mb-2 font-medium">{error}</ErrorText>}

            <StepNav
                current={3}
                nextLabel="Verify"
                onNext={() => { if (validate()) onNext(); }}
                onJump={() => { }}
            />
        </FormWrapper>
    );
}

function Step4({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [showCf, setShowCf] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!password) newErrors.password = "Password is required";
        else if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
        if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
        else if (confirmPassword !== password) newErrors.confirmPassword = "Passwords do not match";
        if (!agreed) newErrors.agreed = "You must agree to the Terms of Service and Privacy Policy";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <FormWrapper>
            <h2 className="text-[#000f2b] text-2xl font-bold">Set Password</h2>
            <p className="text-gray-500 text-sm mt-1 mb-8">Secure your new account</p>
            <Stepper current={4} />

            <div className="flex flex-col mb-6" style={{ gap: "20px", marginBottom: "20px" }}>

                <div>
                    <label className="form-label">Password</label>
                    <div style={{ position: "relative", width: "100%" }}>
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Create your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                paddingRight: "2.75rem",
                            }}
                            className="border border-[#dddddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPw((p) => !p)}
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
                            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {errors.password && <ErrorText className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</ErrorText>}
                </div>


                <div>
                    <label className="form-label">Confirm Password</label>
                    <div style={{ position: "relative", width: "100%" }}>

                        <input
                            type={showCf ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            style={{
                                width: "100%",
                                paddingRight: "2.75rem",
                            }}
                            className="border border-[#dddddd] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#00B4D8] transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCf((p) => !p)}
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
                            {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>

                    </div>
                    {errors.confirmPassword && <ErrorText className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</ErrorText>}
                </div>


                <div style={{ paddingTop: "0.25rem" }}>
                    <label style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            style={{ marginTop: 2, width: 16, height: 16, flexShrink: 0, accentColor: "#00B4D8" }}
                        />
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", lineHeight: "1.5" }}>
                            I agree to the{" "}
                            <a href="#" style={{ color: "#006D8A", fontWeight: 600 }}>Terms of Service</a>
                            {" "}and{" "}
                            <a href="#" style={{ color: "#006D8A", fontWeight: 600 }}>Privacy Policy</a>
                        </span>
                    </label>
                    {errors.agreed && <ErrorText className="text-red-600 text-xs mt-1 font-medium">{errors.agreed}</ErrorText>}
                </div>

            </div>

            <StepNav
                current={4}
                nextLabel="Register"
                onNext={() => { if (validate()) onSubmit(); }}
            />
        </FormWrapper>
    );
}


export default function RegisterDesktop() {
    const [step, setStep] = useState(1);

    return (
        <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <Card className="w-full max-w-[900px] min-h-[580px] flex overflow-hidden border border-[#dddddd] shadow-sm bg-white">
                <LeftPanel />
                {step === 1 && <Step1 onNext={() => setStep(2)} />}
                {step === 2 && <Step2 onBack={() => setStep(1)} onNext={() => setStep(3)} />}
                {step === 3 && <Step3 onBack={() => setStep(2)} onNext={() => setStep(4)} />}
                {step === 4 && <Step4 onBack={() => setStep(3)} onSubmit={() => console.log("Registered!")} />}
            </Card>
        </main>
    );
}