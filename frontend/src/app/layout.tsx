import type { Metadata } from 'next'
import { Montserrat, Inter } from 'next/font/google'
import './globals.css'
import NavBar from '@/components/NavBar'
import { AuthProvider } from '@/context/AuthContext'
import ThemeProvider from '@/providers/ThemeProvider'
import HelpMenuWrapper from '@/components/HelpMenuWrapper'
import { cn } from "@/lib/utils";
import { TooltipProvider } from '@/components/ui/tooltip'
import ProtectedRoute from '@/components/auth/ProtectedRoute' 

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Uni Textbook Marketplace',
  description: 'Buy, sell and swap textbooks with students from your university',
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <body className={`${montserrat.variable} font-sans antialiased`} suppressHydrationWarning>
        <TooltipProvider>
          <ThemeProvider>
            <AuthProvider>
              <NavBar />
              <main>
                <ProtectedRoute>
                  {children}
                </ProtectedRoute>
              </main>
              <HelpMenuWrapper />
            </AuthProvider>
          </ThemeProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}