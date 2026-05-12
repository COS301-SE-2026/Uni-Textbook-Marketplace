"use client";

import React, { useEffect, useState } from "react";
import LoginMobile from "./LoginMobile";
import LoginDesktop from "./LoginDesktop";

export default function LoginPage() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);

        check();
        window.addEventListener("resize", check);

        return () => window.removeEventListener("resize", check);
    }, []);

    return isMobile ? <LoginMobile /> : <LoginDesktop />;
}