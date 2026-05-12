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


