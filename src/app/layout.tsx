"use client"

import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { AnimatePresence } from "framer-motion";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
        <body>
          <SessionProvider>
            <Toaster />
            <AnimatePresence>
                {children}
            </AnimatePresence>
          </SessionProvider>
        </body>
    </html>
  );
}
