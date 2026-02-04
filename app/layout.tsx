import type { Metadata } from "next";
import { Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import BackgroundHearts from "@/components/BackgroundHearts";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import ClientGate from "@/components/ClientGate";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sai X Kuu | Eternity",
  description: "A digital timeline of our love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${geistMono.variable} font-sans antialiased min-h-screen relative overflow-x-hidden selection:bg-purple-500/30 bg-[var(--background)] text-[var(--foreground)]`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
            {/* Entry Gate - Blocks Everything */}
            <ClientGate />

            {/* Retro Grid Background */}
            <div className="fixed inset-0 retro-grid pointer-events-none" />
            
            {/* Abstract Hearts Background */}
            <BackgroundHearts />
            
            {/* CRT Scanline Overlay */}
            <div className="scanlines pointer-events-none fixed inset-0 z-50 mix-blend-overlay opacity-50" />
            
            {/* Theme Toggle */}
            <div className="fixed top-6 right-6 z-[10000]">
               <ThemeToggle />
            </div>

            <main className="relative z-10 min-h-screen flex flex-col">
              {children}
            </main>
            
            <Navigation />
        </ThemeProvider>
      </body>
    </html>
  );
}
