"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FaGhost } from "react-icons/fa";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-700 text-white text-center px-6 relative overflow-hidden">
      <motion.div 
        initial={{ y: 0, rotate: 0, opacity: 0 }}
        animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5], opacity: 1 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-[120px] md:text-[180px] drop-shadow-2xl"
      >
        <FaGhost />
      </motion.div>

      <motion.h1 
        initial={{ y: -50, opacity: 0, textShadow: "0px 0px 5px rgba(255,255,255,0.3)" }} 
        animate={{ y: 0, opacity: 1, textShadow: "0px 0px 20px rgba(255,255,255,0.6)" }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-6xl md:text-8xl font-extrabold mt-4"
      >
        404
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, delay: 0.3 }}
        className="text-lg md:text-2xl mt-2 font-light"
      >
        Oops! You found a ghost page 👻
      </motion.p>

      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotateX: 10, boxShadow: "0px 5px 15px rgba(255,255,255,0.3)" }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.3 }}
        onClick={() => router.push("/dashboard")}
        className="mt-6 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg hover:shadow-2xl transition"
      >
        🔙 Go Home
      </motion.button>

      <motion.div
        initial={{ scale: 1, opacity: 0.2 }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-[30%] left-1/2 transform -translate-x-1/2 w-72 h-72 bg-white rounded-full blur-3xl opacity-30"
      />
    </div>
  );
}