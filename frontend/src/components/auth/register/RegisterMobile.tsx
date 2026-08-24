"use client";
import React, { useState } from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input, ErrorText, Select } from "@/components/ui";
import { Eye, EyeOff, Check } from "lucide-react";
import { registerUser, verifyOtp, resendOtp, getUniversities, University } from "@/lib/auth.api";
import type { ApiError } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from '@/context/AuthContext';
import { getMe } from '@/lib/auth.api';

// Types
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

// Step Indicator
function StepIndicator({ currentStep }: Readonly<{ currentStep: number }>) {
    const steps = ["Personal\nDetails", "University\nEmail", "Password", "Verification"];
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
                                    transition: "border-color 0.3s, color 0.3s",
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
                                    transition: "color 0.3s",
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
                                    transition: "background-color 0.3s",
                                }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// OTP Input
function OtpInput({ value, onChange }: Readonly<{ value: string[]; onChange: (val: string[]) => void }>) {
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
        if (digit && index < 5) inputRefs[index + 1].current?.focus();
    };
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !value[index] && index > 0) inputRefs[index - 1].current?.focus();
    };
    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const next = [...value];
        pasted.split("").forEach((char, i) => { next[i] = char; });
        onChange(next);
        inputRefs[Math.min(pasted.length, 5)].current?.focus();
    };
    return (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
            {value.map((digit, index) => (
                <input
                    key={`otp-mobile-${index}`}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    style={{
                        width: "2.75rem", height: "3rem",
                        textAlign: "center", fontSize: "1.1rem", fontWeight: 600,
                        border: digit ? "2px solid #00B4D8" : "2px solid #dddddd",
                        borderRadius: "0.5rem", outline: "none",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                        color: "#000f2b",
                        backgroundColor: "#ffffff",
                    }}
                    onFocus={(e) => { 
                        e.target.style.borderColor = "#00B4D8";
                        e.target.style.boxShadow = "0 0 0 3px rgba(0, 180, 216, 0.15)";
                    }}
                    onBlur={(e) => { 
                        e.target.style.borderColor = digit ? "#00B4D8" : "#dddddd";
                        e.target.style.boxShadow = "none";
                    }}
                />
            ))}
        </div>
    );
}

// Dot color helper
function getDotColor(n: number, step: number): string {
    if (n === step) return "#ffffff";
    if (n < step) return "#00B4D8";
    return "#9ca3af";
}

// Per-step render helpers
type StepProps = {
    form: FormData;
    errors: Record<string, string>;
    set: (field: keyof FormData, value: FormData[keyof FormData]) => void;
    step: number;
};

function StepOne({ form, errors, set, step }: Readonly<StepProps>) {
    return (
        <>
            <h2 style={{ fontSize: "1.25rem" }}>Create an account</h2>

            <p className="text-text-subtle mt-1 mb-5" style={{ fontSize: "0.9rem" }}>Fill in your details to get started</p>
            <StepIndicator currentStep={step} />

            <div className="space-y-4">

                <div>
                    <Input label="Full Name(s)" type="text" placeholder="Enter your full name(s)"
                        value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
                    {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}
                </div>

                <div>

                    <Input label="Surname" type="text" placeholder="Enter your surname"
                        value={form.surname} onChange={(e) => set("surname", e.target.value)} />
                    {errors.surname && <ErrorText>{errors.surname}</ErrorText>}
                </div>

            </div>
        </>
    );
}

type StepTwoProps = Readonly<StepProps & {
    universities: University[];
    selectedDomain: string;
    setSelectedDomain: (d: string) => void;
}>;

function StepTwo({ form, errors, set, step, universities, selectedDomain, setSelectedDomain }: StepTwoProps) {
    return (
        <>
            <h2 style={{ fontSize: "1.25rem" }}>Enter university details</h2>
            <p className="text-text-subtle mt-1 mb-5" style={{ fontSize: "0.9rem" }}>Select & Fill in your details to get started</p>
            <StepIndicator currentStep={step} />
            <div className="space-y-4">
                {/* University Select */}
                <div>
                    <Select
                        label="Name of University/Institution"
                        name="university"
                        value={form.university_id}
                        onChange={(e) => {
                            const selected = universities.find((u) => u.id === e.target.value);
                            set("university_id", e.target.value);
                            set("university_name", selected?.name ?? "");
                            setSelectedDomain(selected?.email_domain ?? "");
                        }}
                    >
                        <option value="">Select your university</option>
                        {universities.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </Select>
                    {errors.university && <ErrorText>{errors.university}</ErrorText>}
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
                    {errors.email && <ErrorText>{errors.email}</ErrorText>}
                    {selectedDomain && (
                        <p className="mt-1 text-xs text-[#00B4D8]">
                            Your email should end in @{selectedDomain}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

type StepThreeProps = Readonly<StepProps & {
    showPassword: boolean;
    setShowPassword: (v: (p: boolean) => boolean) => void;
    showConfirm: boolean;
    setShowConfirm: (v: (p: boolean) => boolean) => void;
}>;

function StepThree({ form, errors, set, step, showPassword, setShowPassword, showConfirm, setShowConfirm }: StepThreeProps) {
    return (
        <>
            <h2 style={{ fontSize: "1.25rem" }}>Password</h2>
            <p className="text-text-subtle mt-1 mb-5" style={{ fontSize: "0.9rem" }}>Create your password</p>
            <StepIndicator currentStep={step} />
            <div className="space-y-4">


                <div>
                    <label htmlFor="reg-password-mobile" className="form-label">Password</label>
                    <div style={{ position: "relative" }}>
                        <input id="reg-password-mobile"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create your password"
                            value={form.password}
                            onChange={(e) => set("password", e.target.value)}
                            className="w-full box-border border border-[#dddddd] rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#00B4D8] focus:shadow-[0_0_0_3px_rgba(0,180,216,0.15)] transition-all"
                        />


                        <button type="button" onClick={() => setShowPassword((p) => !p)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            style={{
                                position: "absolute", top: 0, right: 0, bottom: 0, width: "2.75rem",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af"
                            }}>
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>


                    {errors.password && <ErrorText>{errors.password}</ErrorText>}
                </div>
                <div>

                    <label htmlFor="reg-confirm-password-mobile" className="form-label">Confirm Password</label>
                    <div style={{ position: "relative" }}>


                        <input id="reg-confirm-password-mobile"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={form.confirmPassword}
                            onChange={(e) => set("confirmPassword", e.target.value)}
                            className="w-full box-border border border-[#dddddd] rounded-lg px-4 py-3 pr-10 text-sm focus:outline-none focus:border-[#00B4D8] focus:shadow-[0_0_0_3px_rgba(0,180,216,0.15)] transition-all"
                        />
                        <button type="button" onClick={() => setShowConfirm((p) => !p)}
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                            style={{
                                position: "absolute", top: 0, right: 0, bottom: 0, width: "2.75rem",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                background: "transparent", border: "none", cursor: "pointer", color: "#9ca3af"
                            }}>
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>


                    </div>
                    {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                    <input type="checkbox" id="terms-mobile"
                        checked={form.agreedToTerms}
                        onChange={(e) => set("agreedToTerms", e.target.checked)}
                        style={{
                            marginTop: "0.15rem", accentColor: "#00B4D8",
                            width: "1rem", height: "1rem", flexShrink: 0, cursor: "pointer"
                        }}
                    />
                    <label htmlFor="terms-mobile" style={{ fontSize: "0.78rem", color: "#3a3a3a", cursor: "pointer" }}>
                        I agree to the{" "}
                        <a href="/terms" className="text-primary" style={{ fontWeight: 500 }}>Terms of Service</a>
                        {" "}and{" "}
                        <a href="/privacy" className="text-primary" style={{ fontWeight: 500 }}>Privacy Policy</a>
                    </label>
                </div>

                {errors.terms && <ErrorText>{errors.terms}</ErrorText>}
            </div>
        </>
    );
}

type StepFourProps = Readonly<StepProps & {
    otpTimer: number;
    timerActive: boolean;
    handleNext: () => void;
    handleResendOtp: () => void;
    loading: boolean;
}>;

function StepFour({ form, errors, set, step, otpTimer, timerActive, handleNext, handleResendOtp, loading }: StepFourProps) {
    return (
        <>
            <h2 style={{ fontSize: "1.25rem" }}>OTP Verification</h2>

            <p className="text-text-subtle mt-1 mb-5" style={{ fontSize: "0.85rem" }}>
                Please enter the OTP (One-Time-Pin) sent to your registered email to complete verification
            </p>


            <StepIndicator currentStep={step} />
            <div>

                <OtpInput value={form.otp} onChange={(val) => set("otp", val)} />
                {errors.otp && <ErrorText>{errors.otp}</ErrorText>}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", fontSize: "0.75rem" }}>
                    <span className="text-text-subtle">
                        Remaining time:{" "}
                        <span style={{ color: "#00B4D8", fontWeight: 600 }}>
                            00:{String(otpTimer).padStart(2, "0")}s
                        </span>
                    </span>
                    <button type="button" onClick={handleResendOtp} disabled={timerActive}
                        style={{
                            color: timerActive ? "#9ca3af" : "#00B4D8", background: "none", border: "none",
                            cursor: timerActive ? "default" : "pointer", fontSize: "0.75rem", fontWeight: 500,
                            transition: "color 0.2s",
                        }}>
                        Resend OTP code
                    </button>
                </div>


                <div style={{ marginTop: "1.5rem" }}>
                    <Button className="w-full cursor-pointer" onClick={handleNext} disabled={loading}>
                        {loading ? "Verifying..." : "REGISTER"}
                    </Button>


                </div>
            </div>
        </>
    );
}

// Main Component
export default function RegisterMobile() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState<FormData>({
        fullName: "", surname: "", university_id: "", university_name: "", email: "",
        otp: ["", "", "", "", "", ""],
        password: "", confirmPassword: "", agreedToTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState("");
    const [otpTimer, setOtpTimer] = useState(59);
    const [timerActive, setTimerActive] = useState(false);
    const [universities, setUniversities] = useState<University[]>([]);
    const [selectedDomain, setSelectedDomain] = useState("");
    const router = useRouter();
    const { login } = useAuth();

    React.useEffect(() => {
        if (step === 4 && !timerActive) { setOtpTimer(59); setTimerActive(true); }
    }, [step, timerActive]);

    React.useEffect(() => {
        if (!timerActive) return;
        if (otpTimer <= 0) { setTimerActive(false); return; }
        const id = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
        return () => clearTimeout(id);
    }, [otpTimer, timerActive]);

    React.useEffect(() => {
        getUniversities()
            .then(setUniversities)
            .catch(() => setServerError("Could not load universities. Please refresh the page"));
    }, []);

    const set = (field: keyof FormData, value: FormData[keyof FormData]) => {
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
        if (!form.university_id) e.university = "Please select your university";
        if (!form.email.trim()) {
            e.email = "University email is required";
        } else if (selectedDomain && !form.email.endsWith(`@${selectedDomain}`)) {
            e.email = `Email must end in @${selectedDomain}`;
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep3 = () => {
        const e: Record<string, string> = {};
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
        if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
        else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
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

        if (step < 4) { setStep((s) => s + 1); return; }

        // Step 4 (OTP) — final submit
        if (!validateStep4()) return;
        setLoading(true);
        try {
            const result = await verifyOtp({ email: form.email, code: form.otp.join('') });
            if (result.user) login(result.user);
            router.push("/listings");
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

    const stepProps = { form, errors, set, step };

    const renderStepContent = () => {
        if (step === 1) return <StepOne {...stepProps} />;
        if (step === 2) return <StepTwo {...stepProps} universities={universities}
            selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain} />;
        if (step === 3) return <StepThree {...stepProps} showPassword={showPassword}
            setShowPassword={setShowPassword} showConfirm={showConfirm} setShowConfirm={setShowConfirm} />;
        if (step === 4) return <StepFour {...stepProps} otpTimer={otpTimer} timerActive={timerActive}
            handleNext={handleNext} handleResendOtp={handleResendOtp} loading={loading} />;
        return null;
    };

    return (
        <main className="auth-bg min-h-screen flex items-center justify-center px-4 py-6">
            <div className="card w-full max-w-[500px] flex flex-col overflow-hidden mx-auto shadow-2xl p-0">
                
                
                
                <div className="w-full relative overflow-hidden px-6 py-8 flex flex-col items-center justify-center" style={{
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                }}>
                    
                    
                    <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%)',
                        }}
                    />
                    <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(255, 255, 255, 0.1) 100px, rgba(255, 255, 255, 0.1) 102px)',
                        }}
                    />
                    
                    
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div 
                            className="relative mb-4 p-3 rounded-2xl"
                            style={{
                                background: 'rgba(255, 255, 255, 0.06)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                            }}
                        >
                            <Logo className="w-14 h-auto" />
                            <div 
                                className="absolute -top-px left-1/4 right-1/4 h-px"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                }}
                            />
                        </div>
                        <h2 
                            className="text-center font-bold"
                            style={{
                                fontSize: "1.25rem",
                                color: '#1a1a2e',
                                textShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
                            }}
                        >
                            JOIN OUR
                        </h2>
                        <h2 
                            className="text-center font-bold mb-1"
                            style={{
                                fontSize: "1.25rem",
                                color: '#00B4D8',
                                textShadow: '0 2px 20px rgba(0, 180, 216, 0.2)',
                            }}
                        >
                            STUDENT COMMUNITY
                        </h2>
                        <div className="relative w-16 h-px my-2">
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(90deg, transparent, rgba(0, 180, 216, 0.4), transparent)',
                                }}
                            />
                        </div>
                        <p className="text-center text-[#4B4F58]/80 text-sm">
                            Buy, sell and swap textbooks with verified students.
                        </p>
                    </div>
                </div>

                
                
                <div className="w-full px-6 py-8 relative" style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(5px)',
                }}>
                    <div className="relative z-10">
                        {renderStepContent()}
                        {serverError && <div style={{ marginTop: "1rem" }}><ErrorText>{serverError}</ErrorText></div>}
                        {step !== 4 && (
                            <div style={{
                                display: "flex", alignItems: "center", justifyContent: "flex-end",
                                gap: "0.5rem", marginTop: "1.75rem"
                            }}>
                                <div style={{ display: "flex", gap: "0.35rem", marginRight: "0.4rem" }}>
                                    {[1, 2, 3, 4].map((n) => (
                                        <div key={n} style={{
                                            width: "1.5rem", height: "1.5rem", borderRadius: "50%",
                                            border: n <= step ? "2px solid #00B4D8" : "2px solid #9ca3af",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "0.65rem", fontWeight: 700,
                                            color: getDotColor(n, step),
                                            backgroundColor: n === step ? "#00B4D8" : "transparent",
                                            transition: "all 0.3s",
                                        }}>
                                            {n}
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={handleNext} disabled={loading} className="px-6 cursor-pointer">
                                    Next
                                </Button>
                                
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}