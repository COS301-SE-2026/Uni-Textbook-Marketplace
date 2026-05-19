"use client";
import React from "react";
import { Check } from "lucide-react";

type StepperProps = Readonly<{
    current: number;
    className?: string;
}>;

const STEPS = [
    "Personal\nDetails",
    "University\nEmail",
    "Verification",
    "Password",
];

function getCircleClass(done: boolean, active: boolean): string {
    if (done) return "bg-[#00B4D8] border-[#00B4D8] text-white";
    if (active) return "border-[#00B4D8] text-[#00B4D8] bg-white";
    return "border-gray-300 text-gray-400 bg-white";
}

export default function Stepper({ current, className = "" }: StepperProps) {
    return (
        <div className={`flex items-start justify-between w-full mb-10 px-2 ${className}`}>
            {STEPS.map((label, i) => {
                const stepNum = i + 1;
                const done = stepNum < current;
                const active = stepNum === current;
                const circleClass = getCircleClass(done, active);
                const labelClass = active ? "text-[#00B4D8] font-semibold" : "text-gray-400";
                const lineClass = done ? "bg-[#00B4D8]" : "bg-gray-200";

                return (
                    <React.Fragment key={stepNum}>
                        <div className="flex flex-col items-center min-w-[60px]">
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all ${circleClass}`}>
                                {done ? <Check className="w-5 h-5" /> : stepNum}
                            </div>
                            <span className={`text-[10px] text-center leading-tight mt-2 whitespace-pre-line ${labelClass}`}>
                                {label}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-[2px] mt-5 mx-2 ${lineClass}`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}