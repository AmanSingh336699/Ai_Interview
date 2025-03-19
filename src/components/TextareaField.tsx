"use client";

import { motion } from "framer-motion";
import { UseFormRegisterReturn } from "react-hook-form";
import { useRef, useState, useCallback, useEffect } from "react";

interface TextareaFieldProps {
  label: string;
  register: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  register,
  error,
  placeholder,
  className,
  maxLength = 2000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [charCount]);

  return (
    <motion.div
      className="relative flex flex-col text-white w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
    >
      <motion.label
        className={`absolute left-3 sm:left-4 transition-all duration-300 text-sm sm:text-base font-semibold ${
          isFocused || charCount > 0
            ? "top-1 sm:top-2 text-xs sm:text-sm text-cyan-300"
            : "top-1/2 -translate-y-1/2 text-gray-400"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {label}
      </motion.label>

      <motion.textarea
        {...register}
        ref={(e) => {
          textareaRef.current = e;
          register.ref(e);
        }}
        placeholder={placeholder || "Type your answer here..."}
        maxLength={maxLength}
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        spellCheck={true}
        autoCorrect="on"
        autoFocus
        className={`pt-6 sm:pt-8 p-3 sm:p-4 border-2 border-gray-600/40 
          backdrop-blur-md rounded-lg text-gray-700 placeholder-gray-400 
          focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:text-white
          focus:border-cyan-400 transition-all duration-300 
          text-sm sm:text-base min-h-[100px] sm:min-h-[120px] 
          max-h-[300px] overflow-y-auto ${className}`}
        whileFocus={{
          scale: 1.02,
          backgroundColor: "rgba(34, 211, 238, 0.15)", 
          boxShadow: "0 0 25px rgba(34, 211, 238, 0.6), inset 0 0 10px rgba(34, 211, 238, 0.3)",
          borderColor: "rgba(34, 211, 238, 0.8)",
        }}
        whileHover={{
          borderColor: "rgba(34, 211, 238, 0.5)",
        }}
        transition={{ duration: 0.3 }}
        style={{ resize: "none" }}
      />

      <motion.div
        className={`absolute bottom-2 right-3 text-xs sm:text-sm transition-all duration-300 ${
          charCount >= maxLength ? "text-red-400" : charCount >= maxLength * 0.9 ? "text-yellow-400" : "text-gray-400"
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {charCount}/{maxLength}
      </motion.div>

      {error && (
        <motion.div
          className="text-white text-xs sm:text-sm mt-1 sm:mt-2 font-medium shadow-[0_0_5px_rgba(248,113,113,0.3)]"
          variants={{
            initial: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
            shake: {
              x: [0, -5, 5, -5, 5, 0],
              transition: { duration: 0.4 },
            },
          }}
          initial="initial"
          animate={["visible", "shake"]}
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TextareaField;