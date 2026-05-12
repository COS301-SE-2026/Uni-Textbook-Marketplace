"use client";

import React from "react";
import Logo from "@/components/icons/Logo";
import { Button, Input } from "@/components/ui";

export default function LoginMobile() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-background-light px-4 py-6">

            <div className="card w-full max-w-[900px] min-h-[500px] flex flex-col overflow-hidden mx-auto">

                {/* LEFT */}
                <div className="w-full border-b border-border bg-cyan-50 px-6 py-8 flex flex-col items-center justify-center">

                    <Logo className="w-16 h-auto mb-6" />

                    <h2 className="text-center">
                        Welcome back!
                    </h2>

                    <p className="text-center text-text-subtle mt-4">
                        Access your university marketplace account.
                    </p>

                </div>

                {/* RIGHT */}
                <div className="w-full px-6 py-8 flex items-center justify-center">

                    <div className="w-full max-w-md mx-auto">

                        <h2>Login</h2>

                        <p className="text-text-subtle mt-2">
                            Enter your details to access your account
                        </p>

                        <form className="mt-8 space-y-5">

                            <Input
                                label="University Email"
                                type="email"
                                placeholder="you@university.ac.za"
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="Enter your password"
                            />

                            <div className="flex justify-end">
                                <a href="#" className="text-sm text-primary">
                                    Forgot Password?
                                </a>
                            </div>

                            <Button className="w-full">
                                Login
                            </Button>

                        </form>

                    </div>
                </div>

            </div>
        </main>
    );
}