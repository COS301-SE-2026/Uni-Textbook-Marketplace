'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeProviderProps {
    readonly children: React.ReactNode;
}

export default function ThemeProvider({ children}: ThemeProviderProps) {
    return (
        <NextThemesProvider 
            attribute="class"
            defaultTheme="light"
            enableSystem={true}
            disableTransitionOnChange={false}
        >
            {children}
        </NextThemesProvider>
    );
}