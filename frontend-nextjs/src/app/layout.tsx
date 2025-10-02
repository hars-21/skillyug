import type { Metadata } from "next";
import { Red_Hat_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../hooks/AuthContext";
import { Toaster } from "react-hot-toast";
import SessionProviderWrapper from "@/components/SessionProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import QueryProvider from "@/components/QueryProvider";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat-display",
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
      <body className={`${redHatDisplay.variable} ${montserrat.variable} antialiased`}>
        <SessionProviderWrapper>
          <AuthProvider>
            <QueryProvider>
              <ErrorBoundary>
                <Toaster position="top-center" />
                {children}
              </ErrorBoundary>
            </QueryProvider>
          </AuthProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
