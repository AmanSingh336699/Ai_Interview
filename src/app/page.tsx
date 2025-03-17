"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const gradientRef = useRef("from-sky-600 to-purple-600");

  useEffect(() => {
    const gradients = [
      "from-sky-600 to-purple-600",
      "from-indigo-500 to-pink-500",
      "from-green-500 to-blue-500",
    ];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % gradients.length;
      gradientRef.current = gradients[index];

      const bgElement = document.getElementById("bg");
      if (bgElement) {
        bgElement.className = `absolute inset-0 bg-gradient-to-r ${gradientRef.current} transition-all duration-1000`;
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const words = [
    "Ace",
    "Your",
    "Next",
    "Job",
    "Interview",
    "with",
    "AI-Powered",
    "Practice",
  ];

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div id="bg" className="absolute inset-0 bg-gradient-to-r from-sky-600 to-purple-600 transition-all duration-1000" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-6">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-wide mb-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.2 },
            },
          }}
        >
          {words.map((word, index) => (
            <motion.span
              key={index}
              className="inline-block mx-1"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
            >
              {word}{" "}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="text-lg sm:text-xl md:text-2xl mb-6"
        >
          Get real-time AI interview simulations, instant feedback, and improve
          your answers effortlessly.
        </motion.p>

        <Link href="/login">
            <motion.button
              whileHover={{
                scale: 1.1,
                background: "linear-gradient(90deg, #FFD700, #FFA500)",
                boxShadow: "0px 10px 30px rgba(255, 165, 0, 0.8)",
                y: -3,
              }}
              whileTap={{ scale: 0.9, y: 2 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition duration-300"
            >
              🚀 Start Now →
            </motion.button>
        </Link>
      </div>
    </div>
  );
}