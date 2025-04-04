"use client"

import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import Loading from "./loading";


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
              <Suspense fallback={<Loading />}>
                {children}
              </Suspense>
            </AnimatePresence>
          </SessionProvider>
        </body>
    </html>
  );
}
