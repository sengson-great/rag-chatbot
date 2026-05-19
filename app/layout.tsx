import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Navigation } from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpeedBook Assistant",
  description: "Ask questions and get instant answers from Speedbook company documents using AI.",
  openGraph: {
    title: "SpeedBook Assistant",
    description: "Ask questions and get instant answers from Speedbook company documents using AI.",
    url: "https://speedbookchatbot.vercel.app/chat",
    siteName: "SpeedBook Assistant",
    images: [
      {
        url: "/logo.jpeg",
        width: 1200,
        height: 630,
        alt: "SpeedBook Assistant Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeedBook Assistant",
    description: "Ask questions and get instant answers from Speedbook company documents using AI.",
    images: ["/logo.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background antialiased`}
      >
        <Navigation/>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
