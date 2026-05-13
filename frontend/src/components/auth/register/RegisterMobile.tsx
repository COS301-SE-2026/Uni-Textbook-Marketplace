"use client";

import React, { useState, useRef, useEffect } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, Stepper } from "@/components/ui";
import { Eye, EyeOff, Check } from "lucide-react";


function TopPanel() {
    return (
        <div className="w-full border-b border-border bg-cyan-50 px-8 py-10 flex flex-col items-center justify-center">
            <Logo className="w-16 h-20 mb-4" />
            <h3 className="text-center text-lg font-bold text-navy">
                Join our student community
            </h3>
            <p className="text-sm text-text-subtle mt-1 text-center">
                Buy and sell textbooks safely
            </p>
        </div>
    );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
    return <div className="flex-1 px-8 py-10 flex flex-col">{children}</div>;
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



function Step1({ onNext }: { onNext: (data: { firstName: string; surname: string }) => void }) {
    const [firstName, setFirstName] = useState("");
    const [surname, setSurname] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!firstName.trim()) e.firstName = "Full name is required";
        if (!surname.trim()) e.surname = "Surname is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    return (
        <StepWrapper>
            <h2 className="text-navy text-xl font-bold">Create an account</h2>
            <p className="text-text-subtle text-sm mt-1 mb-8">Fill in your details to get started</p>

            <Stepper current={1} />

            <div className="space-y-5">
                <div>
                    <Input
                        label="Full Name(s)"
                        type="text" placeholder="Enter your full name(s)"
                        value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                    />
                    {errors.firstName && <ErrorText className="text-red-500 text-xs mt-1">{errors.firstName}</ErrorText>}
                </div>
                <div>
                    <Input label="Surname"
                        type="text"
                        placeholder="Enter your surname"
                        value={surname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)}
                    />
                    {errors.surname && <ErrorText >{errors.surname}</ErrorText>}
                </div>
            </div>
            <div className="flex justify-end mt-10" style={{ margin: '20px' }} >
                <Button className="w-full sm:w-auto px-10" onClick={() => { if (validate()) onNext({ firstName, surname }); }}>Next</Button>
            </div>
        </StepWrapper>
    );
}

function Step2({ onNext, onBack }: { onNext: (data: { institution: string; email: string }) => void; onBack: () => void }) {
    const [institution, setInstitution] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const e: Record<string, string> = {};
        if (!institution.trim()) e.institution = "Institution name is required";
        if (!email.trim()) e.email = "University email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    return (
        <StepWrapper>
            <h2 className="text-navy text-xl font-bold">Enter university details</h2>
            <p className="text-text-subtle text-sm mt-1 mb-8">Tell us where you study</p>
            <Stepper current={2} />
            <div className="space-y-5">
                <div>
                    <Input label="Name of University/Institution" type="text" placeholder="Search institution..."
                        value={institution} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstitution(e.target.value)} />
                    {errors.institution && <ErrorText className="text-red-500 text-xs mt-1">{errors.institution}</ErrorText>}
                </div>
                <div>
                    <Input label="University Email" type="email" placeholder="you@university.ac.za"
                        value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                    {errors.email && <ErrorText className="text-red-500 text-xs mt-1">{errors.email}</ErrorText>}
                </div>
            </div>
            <div className="flex mt-10 justify-center" style={{ gap: '5rem', margin: '20px' }} >
                <Button variant="secondary" className="w-32" onClick={onBack}>Back</Button>
                <Button className="w-32" onClick={() => { if (validate()) onNext({ institution, email }); }}>Next</Button>
            </div>
        </StepWrapper>
    );
}

function Step3({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [error, setError] = useState("");
    const [seconds, setSeconds] = useState(90);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    return (
        <StepWrapper>
            <h2 className="text-navy text-xl font-bold">OTP Verification</h2>
            <p className="text-text-subtle text-sm mt-1 mb-8">Verify your email address</p>
            <Stepper current={3} />
            <p className="text-sm text-text-dark mb-6 leading-relaxed">
                Please enter the OTP sent to your registered email to complete verification.
            </p>


            <div className="flex justify-between gap-2 mb-4" style={{ gap: "5px" }}>
                {otp.map((digit, i) => (
                    <input key={i} ref={el => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className={`w-11 h-13 border-2 rounded-lg text-center text-xl font-bold focus:outline-none transition-all
                            ${digit ? "border-[#00B4D8] bg-[#e8f8fc]" : "border-[#dddddd] bg-white"}
                            focus:border-[#00B4D8]`}
                    />
                ))}
            </div>

            <div className="flex flex-col text-xs" style={{ gap: "10px" }}>
                <span className="text-text-subtle" style={{ margin: "10px" }}>
                    Remaining time: <span className={`font-bold ${seconds < 30 ? "text-red-500" : "text-primary"}`}>{fmt}</span>
                </span>
                <Button onClick={() => setSeconds(60)} className="text-primary font-semibold text-left hover:underline w-fit">Resend OTP code</Button>
            </div>

            {error && <ErrorText className="text-red-500 text-xs mb-4">{error}</ErrorText >}

            <div className="flex mt-10 justify-center" style={{ gap: '5rem', margin: '20px' }} >
                <Button variant="secondary" className="flex-1" onClick={onBack}>Back</Button>
                <Button className="flex-1" onClick={() => {
                    if (otp.some(d => d === "")) { setError("Please enter all 6 digits"); return; }
                    setError(""); onNext();
                }}>Verify</Button>
            </div>

        </StepWrapper>
    );
}

function Step4({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showPw, setShowPw] = useState(false);
    const [showCf, setShowCf] = useState(false);

    const validate = () => {
        const e: Record<string, string> = {};
        if (!password) e.password = "Password is required";
        else if (password.length < 8) e.password = "Password must be at least 8 characters";
        if (!confirm) e.confirm = "Please confirm your password";
        else if (confirm !== password) e.confirm = "Passwords do not match";
        if (!agreed) e.agreed = "You must agree to the Terms of Service and Privacy Policy";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    return (
        <StepWrapper>
            <h2 className="text-navy text-xl font-bold">Set Password</h2>
            <p className="text-text-subtle text-sm mt-1 mb-8">Secure your new account</p>
            <Stepper current={4} />
            <div className="space-y-5">

                <div>
                    <label className="form-label">Password</label>
                    <div style={{ position: "relative", width: "100%" }}>
                        <input
                            type={showPw ? "text" : "password"}
                            placeholder="Create your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "85%",
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
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            style={{
                                width: "85%",
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


                <div style={{ paddingTop: "0.25rem", marginTop: "20px" }}>
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
            <div className="flex gap-4 mt-10" style={{ gap: '5rem', margin: '20px' }}>
                <Button variant="secondary" className="flex-1" onClick={onBack}>Back</Button>
                <Button className="flex-1" onClick={() => { if (validate()) onSubmit(); }}>Register</Button>
            </div>
        </StepWrapper>
    );
}


export default function RegisterMobile() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Record<string, string>>({});

    return (
        <main className="min-h-screen bg-white">
            <div className="w-full flex flex-col">
                <TopPanel />

                {step === 1 && <Step1 onNext={data => { setFormData(f => ({ ...f, ...data })); setStep(2); }} />}
                {step === 2 && <Step2 onBack={() => setStep(1)} onNext={data => { setFormData(f => ({ ...f, ...data })); setStep(3); }} />}
                {step === 3 && <Step3 onBack={() => setStep(2)} onNext={() => setStep(4)} />}
                {step === 4 && <Step4 onBack={() => setStep(3)} onSubmit={() => { console.log("Submit", formData); }} />}
            </div>
        </main>
    );
}