import { motion, AnimatePresence } from "framer-motion";
import React, { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

interface FunnyProps {
  message?: string;
  onClose: () => void;
  show?: boolean
}

const Funny: React.FC<FunnyProps> = ({ message, onClose, show = true }) => {
  if(!show) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-md z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                   z-50 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 
                   text-white text-sm sm:text-lg md:text-xl px-6 py-6 rounded-2xl shadow-2xl 
                   border border-white/30 max-w-[90%] sm:max-w-md text-center 
                   ring-2 ring-white/50 hover:ring-yellow-400 transition-all duration-300"
        initial={{ opacity: 0, scale: 0.8, y: -30 }}
        animate={{ opacity: 1, scale: 1, rotate: 2, x: "-50%", y: "-50%" }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ duration: 0.4, ease: "easeOut", type: "spring", stiffness: 120 }}
      >
        <motion.button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-lg font-bold 
                     hover:text-red-500 transition-transform transform hover:scale-125 hover:rotate-12"
          whileHover={{ rotate: 15, scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          ✖
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {message?.split("\n").map((line) => (
            <p key={uuidv4()} className="whitespace-pre-line text-white/90 text-xl sm:text-2xl">
              🎉 {line} 🎉
            </p>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(Funny);