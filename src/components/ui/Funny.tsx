import { motion, AnimatePresence } from "framer-motion";
import React from "react";

interface FunnyProps {
  message?: string;
  onClose: () => void;
  show?: boolean;
}

const Funny: React.FC<FunnyProps> = ({ message, onClose, show = true }) => {
  const modalVariants = {
    hidden: { opacity: 0, scale: 0, x: "-50%", y: "-50%" },
    show: { opacity: 1, scale: 1, x: "-50%", y: "-50%" },
    exit: { opacity: 0, scale: 0, x: "-50%", y: "-50%" },
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />

      <motion.div
        className="fixed top-1/2 left-1/2 z-50 bg-gradient-to-br from-blue-500 to-purple-600 
                   text-white px-6 py-6 rounded-2xl shadow-2xl max-w-[90%] sm:max-w-md text-center"
        variants={modalVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        <motion.button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-lg font-bold 
                     hover:text-red-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          ✖
        </motion.button>
        <p className="text-xl sm:text-2xl">🎉 {message || "Hello!"} 🎉</p>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(Funny);