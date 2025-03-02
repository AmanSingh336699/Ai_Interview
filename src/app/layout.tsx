"use client"

import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider, useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import Header from "@/components/ui/Header";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
        <body>
          <SessionProvider>
           <Header />
            <Toaster />
            <AnimatePresence>
              {children}
            </AnimatePresence>
          </SessionProvider>
        </body>
    </html>
  );
}
