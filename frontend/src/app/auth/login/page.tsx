
"use client"
import React, { useState } from 'react';
import Logo from "@/components/icons/Logo";
import { Button, Input } from "@/components/ui";


export default function LoginPage() {


    return (
        <main className="min-h-screen flex items-center justify-center bg-background-red px-4">
            
            <div className='card w-full max-w-5xl flex overflow-hidden'>

                {/*left*/}
                <div className='w-1/3 bg-cyan-50 p-8'>
                    <div className='text-6xl mb-6'>
                        <Logo className="w-40 h-auto" />
                    </div>

                    <h2 className="text-center">
                        Welcome back!
                    </h2>

                    <p className="mt-4 text-center text-text-subtle">
                        Access your university marketplace account.
                    </p>
                </div>

                {/*Right*/}
                <div className='flex-1 p-10'>
                    <div className="max-w-md mx-auto">
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