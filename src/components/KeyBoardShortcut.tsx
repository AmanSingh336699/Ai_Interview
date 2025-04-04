"use client";

import { motion } from "framer-motion";
import { FaKeyboard, FaArrowRight } from "react-icons/fa";

const KeyboardShortcut = () => {
  return (
    <motion.div
      className="mt-6 p-4 w-full max-w-lg bg-gray-800 text-gray-200 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between text-sm sm:text-base"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center">
        <FaKeyboard className="text-yellow-400 mr-2" />
        <span>Press <strong>Ctrl + H</strong> to Get a Hint</span>
      </div>
      <FaArrowRight className="hidden sm:block text-gray-400" />
      <div className="flex items-center">
        <FaKeyboard className="text-green-400 mr-2" />
        <span>Press <strong>Ctrl + Enter</strong> to Submit</span>
      </div>
    </motion.div>
  );
};

export default KeyboardShortcut;
