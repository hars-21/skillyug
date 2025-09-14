import type { Metadata } from "next";
import { Reddit_Sans, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../hooks/AuthContext";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

const redditSans = Reddit_Sans({
  variable: "--font-reddit-sans",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Skillyug 2.0",
  description: "Learn and grow with Skillyug",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${redditSans.variable} ${montserrat.variable} antialiased`}
      >
        <SessionProvider>
          <AuthProvider>
            <Toaster />
            {children}
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
