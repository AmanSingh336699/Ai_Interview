"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <motion.div
        className="px-6 py-3 rounded-lg text-lg font-semibold text-white relative overflow-hidden shadow-lg w-fit"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        />

        <div className="relative flex items-center space-x-1">
          <span>Loading</span>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="text-white"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0],
                x: [0, 2, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            >
              .
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}