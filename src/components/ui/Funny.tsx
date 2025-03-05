import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import { v4 as uuidv4 } from "uuid"

interface FunnyProps {
  message?: string;
  onClose: () => void;
}

const Funny: React.FC<FunnyProps> = ({ message, onClose }) => {
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
                   z-50 bg-gradient-to-br from-gray-900 to-gray-800 text-white 
                   text-sm sm:text-lg md:text-xl px-6 py-6 rounded-2xl shadow-2xl 
                   border border-gray-700 max-w-[90%] sm:max-w-md text-center 
                   ring-2 ring-blue-500/50 hover:ring-blue-500 transition-all duration-300"
        initial={{ opacity: 0, scale: 0.8, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
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
            <p key={uuidv4()} className="whitespace-pre-line">{line}</p>
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(Funny);