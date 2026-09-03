"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser, getMe } from "@/lib/auth.api";
import { useAuth } from "@/context/AuthContext";

type LoginErrors = Record<string, string>;

export function useLoginForm() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [errors, setErrors] = useState<LoginErrors>({});
const [loading, setLoading] = useState(false);
const [serverError, setServerError] = useState("");
const [banMessage, setBanMessage] = useState<string | null>(null);


const router = useRouter();
const { login } = useAuth();

const validate = () => {
    const validationErrors: LoginErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
        validationErrors.email = "University email is required";
    } else if (!emailRegex.test(email)) {
        validationErrors.email = "Invalid email";
    }

    if (!password) {
        validationErrors.password = "Password is required";
    } else if (password.length < 8) {
        validationErrors.password = "Password must be at least 8 characters";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
};

const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setServerError("");
    setBanMessage(null);

    if (!validate()) {
        return;
    }

    setLoading(true);

    try {
        const normalizedEmail = email.toLowerCase().trim();

        const response = await loginUser({
            email: normalizedEmail,
            password,
        });

        if (response.user?.is_banned) {
            sessionStorage.setItem(
                "ban_message",
                response.user.ban_reason || "Account banned"
            );

            login(response.user);
            router.push("/appeal");

            return;
        }

        const me = await getMe();

        login(me);
        router.push("/listings");
    } catch (err: unknown) {
        const error = err as {
            response?: {
                status?: number;
                data?: {
                    message?: string;
                };
            };
            message?: string;
        };

        console.log("Login error:", error);
        console.log("Error response:", error.response);

        if (error.response?.status === 403) {
            const message = error.response?.data?.message || "";

            if (message.toLowerCase().includes("banned")) {
                setBanMessage(message);
                return;
            }
        }

        const message =
            error.response?.data?.message ||
            error.message ||
            "";

        if (message.toLowerCase().includes("banned")) {
            setBanMessage(message);
            return;
        }

        setServerError(
            message || "Login failed. Please try again."
        );
    } finally {
        setLoading(false);
    }
};

const clearEmailError = () => {
    if (errors.email) {
        setErrors((previous) => ({
            ...previous,
            email: "",
        }));
    }
};

const clearPasswordError = () => {
    if (errors.password) {
        setErrors((previous) => ({
            ...previous,
            password: "",
        }));
    }
};

const forgotPass = () => {
    router.push("/auth/resetpassword");
};

const handleGoToAppeal = () => {
    if (banMessage) {
        sessionStorage.setItem("ban_message", banMessage);
    }

    router.push("/appeal");
};

return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    errors,
    loading,
    serverError,
    banMessage,
    handleSubmit,
    clearEmailError,
    clearPasswordError,
    forgotPass,
    handleGoToAppeal,
};


}
