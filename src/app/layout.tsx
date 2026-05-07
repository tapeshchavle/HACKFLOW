import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SWRProvider } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HackFlow — Hackathon Management Platform",
  description:
    "The all-in-one platform for managing hackathons, teams, submissions, and smart judging.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#818cf8",
          colorBackground: "#fcf5f5ff",
          colorText: "#f1f5f9",
          colorTextSecondary: "#94a3b8",
          colorInputBackground: "#1e293b",
          colorInputText: "#f1f5f9",
        },
        elements: {
          card: "bg-gray-950 border border-gray-800",
          headerTitle: "text-white",
          headerSubtitle: "text-gray-400",
          socialButtonsBlockButton: "bg-gray-900 border-gray-800 hover:bg-gray-800 text-white",
          socialButtonsBlockButtonText: "text-white font-semibold",
          dividerLine: "bg-gray-800",
          dividerText: "text-gray-500",
          formFieldLabel: "text-gray-300",
          formFieldInput: "bg-gray-900 border-gray-800 text-white focus:border-indigo-500",
          footerActionText: "text-gray-400",
          footerActionLink: "text-indigo-400 hover:text-indigo-300",
          identityPreviewText: "text-white",
          identityPreviewEditButtonIcon: "text-gray-400 hover:text-white",
        }
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <TooltipProvider>
            <SWRProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "oklch(0.2 0.02 270)",
                    border: "1px solid oklch(0.3 0.02 270)",
                    color: "oklch(0.96 0 0)",
                  },
                }}
              />
            </SWRProvider>
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
