import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { AIAssistant } from "@/components/ai/AIAssistant";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "Franklin Chieze — Engineer. Entrepreneur. Builder.",
  description:
    "Personal portfolio of Franklin Chieze — Building ProteusAI & Dreambase. Engineer, entrepreneur, and builder of things that matter across Africa.",
  openGraph: {
    title: "Franklin Chieze",
    description: "Engineer. Entrepreneur. Builder of things that matter.",
    url: "https://franklin.chieze.me",
    siteName: "Franklin Chieze",
    type: "website",
  },
};

// Runs before React hydrates — sets data-theme from localStorage or time of day
const themeScript = `(function(){var k="fchieze-theme-override",s=localStorage.getItem(k);if(s){document.documentElement.setAttribute("data-theme",s);return;}var h=new Date().getHours();var t=h>=5&&h<12?"dawn":h>=12&&h<17?"day":h>=17&&h<20?"dusk":"night";document.documentElement.setAttribute("data-theme",t);})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/" appearance={{ variables: { colorPrimary: "#0071e3", borderRadius: "0.75rem" } }}>
      <html lang="en" className={`${geist.variable} h-full antialiased`} suppressHydrationWarning>
        <head>
          {/* beforeInteractive = runs before hydration, no React warning */}
          <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="min-h-full flex flex-col" suppressHydrationWarning>
          <ThemeProvider>
            <Nav />
            <main className="flex-1">{children}</main>
            <Footer />
            <AIAssistant />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
