"use client";

import React, { useState, useRef, useEffect } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input } from "@/components/ui";

import {
    Check,
    Eye,
    EyeOff,
    Mail,
    GraduationCap,
    User,
} from "lucide-react"


const STEPS = [
    "Personal\nDetails",
    "University\nEmail",
    "Verification",
    "Password",
];

function Stepper({ current }: { current: number }) {
    return (
        <div className="flex items-start justify-between mb-8 w-full max-w-[420px]">
            {STEPS.map((label, i) => {
                const stepNum = i + 1;
                const done = stepNum < current;
                const active = stepNum === current;

                return (
                    <React.Fragment key={i}>
                        <div className="flex flex-col items-center min-w-[60px]">
                            <div
                                className={`
                  w-10 h-10 rounded-full border-2 flex items-center justify-center
                  text-sm font-semibold transition-all

                  ${done
                                        ? "bg-primary border-primary text-white"
                                        : active
                                            ? "border-primary text-primary bg-white"
                                            : "border-gray-400 text-gray-500 bg-white"
                                    }
                `}
                            >
                                {done ? (
                                    <Check className="w-5 h-5" />
                                ) : (
                                    stepNum
                                )}
                            </div>

                            <span
                                className={`
                  text-[10px] text-center leading-tight mt-2 whitespace-pre-line
                  ${active ? "text-primary font-semibold" : "text-text-subtle"}
                `}
                            >
                                {label}
                            </span>
                        </div>

                        {i < STEPS.length - 1 && (
                            <div
                                className={`
                  flex-1 h-[2px] mt-5 mx-2
                  ${done ? "bg-primary" : "bg-gray-300"}
                `}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}


function LeftPanel() {
    return (
        <div className="w-[240px] shrink-0 border-r border-border bg-cyan-50 p-8 flex flex-col items-center justify-center">
            <Logo className="w-24 h-28 mb-6 pr-10" />
            <h3 className="text-center font-semibold text-navy">Join our student community</h3>
        </div>
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
        <div className="flex-1 p-8 flex flex-col justify-center">
            <h2 className="text-navy">Create an account</h2>
            <p className="text-text-subtle text-sm mt-1 mb-6">Fill in your details to get started</p>
            <Stepper current={1} />
            <div className="space-y-4">
                <div>
                    <Input label="Full Name(s)" type="text" placeholder="Enter your full name(s)" value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)} />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                    <Input label="Surname" type="text" placeholder="Enter your surname" value={surname}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSurname(e.target.value)} />
                    {errors.surname && <p className="text-red-500 text-xs mt-1">{errors.surname}</p>}
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <Button onClick={() => { if (validate()) onNext({ firstName, surname }); }}>Next</Button>
            </div>
        </div>
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
        <div className="flex-1 p-8 flex flex-col justify-center">
            <h2 className="text-navy">Enter university details</h2>
            <p className="text-text-subtle text-sm mt-1 mb-6">Fill in your details to get started</p>
            <Stepper current={2} />
            <div className="space-y-4">
                <div>
                    <Input label="Name of University/Institution" type="text" placeholder="Enter the name of the University/Institution"
                        value={institution} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstitution(e.target.value)} />
                    {errors.institution && <p className="text-red-500 text-xs mt-1">{errors.institution}</p>}
                </div>
                <div>
                    <Input label="University Email" type="email" placeholder="you@university.ac.za / you@university.co.za"
                        value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <Button onClick={onBack} className="bg-white border border-border text-text-dark hover:bg-gray-50">Back</Button>
                <Button onClick={() => { if (validate()) onNext({ institution, email }); }}>Next</Button>
            </div>
        </div>
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
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(""));
            inputRefs.current[5]?.focus();
        }
    };

    const validate = () => {
        if (otp.some(d => d === "")) { setError("Please enter all 6 digits"); return false; }
        setError("");
        return true;
    };

    const fmt = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

    return (
        <div className="flex-1 p-8 flex flex-col justify-center">
            <h2 className="text-navy">OTP Verification</h2>
            <p className="text-text-subtle text-sm mt-1 mb-6">Fill in your details to get started</p>
            <Stepper current={3} />
            <p className="text-sm text-text-dark mb-4">
                Please enter the OTP (One-Time-Pin) sent to your registered email to complete verification
            </p>
            <div className="flex gap-2 mb-2" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                    <input key={i} ref={el => { inputRefs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className={`w-10 h-12 text-center text-lg font-semibold border-2 rounded focus:outline-none focus:border-primary transition-colors
                            ${digit ? "border-primary" : "border-border"}`} />
                ))}
            </div>
            <div className="flex justify-between items-center text-xs text-text-subtle mb-2">
                <span>Remaining time: <span className={`font-semibold ${seconds < 30 ? "text-red-500" : "text-primary"}`}>{fmt}</span></span>
                <button onClick={() => setSeconds(90)} className="text-primary hover:underline">Resend OTP code</button>
            </div>
            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
            <div className="flex justify-between mt-4">
                <Button onClick={onBack} className="bg-white border border-border text-text-dark hover:bg-gray-50">Back</Button>
                <Button onClick={() => { if (validate()) onNext(); }}>Verify</Button>
            </div>
        </div>
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
        <div className="flex-1 p-8 flex flex-col justify-center">
            <h2 className="text-navy">Password</h2>
            <p className="text-text-subtle text-sm mt-1 mb-6">Create your password</p>
            <Stepper current={4} />
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-text-dark block mb-1">Password</label>
                    <div className="relative">
                        <input type={showPw ? "text" : "password"} placeholder="Create your password" value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border border-border rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-primary bg-background-input" />
                        <button type="button" onClick={() => setShowPw(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-dark">
                            {showPw ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                    <label className="text-sm font-medium text-text-dark block mb-1">Confirm Password</label>
                    <div className="relative">
                        <input type={showCf ? "text" : "password"} placeholder="Confirm your password" value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            className="w-full border border-border rounded px-3 py-2 pr-10 text-sm focus:outline-none focus:border-primary bg-background-input" />
                        <button type="button" onClick={() => setShowCf(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-dark">
                            {showCf ? (
                                <EyeOff className="w-4 h-4" />
                            ) : (
                                <Eye className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                    {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm}</p>}
                </div>
                <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                            className="mt-0.5 accent-primary" />
                        <span className="text-sm text-text-subtle">
                            I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                        </span>
                    </label>
                    {errors.agreed && <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>}
                </div>
            </div>
            <div className="flex justify-between mt-6">
                <Button onClick={onBack} className="bg-white border border-border text-text-dark hover:bg-gray-50">Back</Button>
                <Button onClick={() => { if (validate()) onSubmit(); }}>Register</Button>
            </div>
        </div>
    );
}


export default function RegisterDesktop() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Record<string, string>>({});

    return (
        <main className="min-h-screen flex items-center justify-center bg-background-light px-4">
            <div className="card w-full max-w-[800px] min-h-[500px] flex overflow-hidden">
                <LeftPanel />
                {step === 1 && <Step1 onNext={data => { setFormData(f => ({ ...f, ...data })); setStep(2); }} />}
                {step === 2 && <Step2 onBack={() => setStep(1)} onNext={data => { setFormData(f => ({ ...f, ...data })); setStep(3); }} />}
                {step === 3 && <Step3 onBack={() => setStep(2)} onNext={() => setStep(4)} />}
                {step === 4 && <Step4 onBack={() => setStep(3)} onSubmit={() => { console.log("Submit", formData); }} />}
            </div>
        </main>
    );
}