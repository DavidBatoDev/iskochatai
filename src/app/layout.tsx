import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "IskoChatAI",
    template: "%s | IskoChatAI",
  },
  description: "IskoChatAI helps Filipino students find and apply for scholarships easily. Get real-time guidance, deadlines, and more!",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "IskoChatAI | Your Scholarship Companion",
    description: "Find scholarships in the Philippines with AI-powered assistance.",
    url: "https://scholarship-helper.vercel.app/",
    siteName: "IskoChatAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IskoChatAI Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "IskoChatAI | Your Scholarship Companion",
    description: "Helping you secure scholarships in the Philippines.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
