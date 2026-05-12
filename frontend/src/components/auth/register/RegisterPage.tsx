"use client";

import React, { useEffect, useState } from "react";
import RegisterMobile from "./RegisterMobile";
import RegisterDesktop from "./RegisterDesktop";

export default function RegisterPage() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return isMobile ? <RegisterMobile /> : <RegisterDesktop />;
}