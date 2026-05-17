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

