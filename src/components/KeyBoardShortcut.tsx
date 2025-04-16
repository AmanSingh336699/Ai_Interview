"use client";

import { motion } from "framer-motion";
import { FaKeyboard } from "react-icons/fa";

const KeyboardShortcut = () => {
  return (
    <motion.div
      className="hidden lg:block mt-6 p-3 w-full max-w-sm mx-auto bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-md rounded-xl shadow-lg flex items-center justify-center gap-4 text-gray-200 text-sm sm:text-base transition-all duration-300 hover:shadow-xl hover:bg-gradient-to-r hover:from-gray-900/90 hover:to-gray-800/90"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2">
        <FaKeyboard className="text-yellow-400 text-lg transition-transform duration-300 hover:scale-110" />
        <span className="font-medium">
          <strong className="text-yellow-300">Ctrl + H</strong> for Hint
        </span>
      </div>
      <div className="flex items-center gap-2">
        <FaKeyboard className="text-green-400 text-lg transition-transform duration-300 hover:scale-110" />
        <span className="font-medium">
          <strong className="text-green-300">Ctrl + Enter</strong> to Submit
        </span>
      </div>
    </motion.div>
  );
};

export default KeyboardShortcut;