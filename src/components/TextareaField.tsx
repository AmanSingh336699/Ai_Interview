"use client";

import { motion } from "framer-motion";
import { UseFormRegisterReturn } from "react-hook-form";
import { useRef, useState, useCallback, useEffect } from "react";
import api from "@/lib/api";

interface TextareaFieldProps {
  label?: string;
  register: UseFormRegisterReturn;
  error?: string;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  disabled?: boolean;
  userId?: string;
  battleCode?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({
  label,
  register,
  error,
  placeholder,
  className,
  maxLength = 2000,
  disabled = false,
  userId,
  battleCode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const lastSent = useRef(0);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const throttleTimeout = useRef<NodeJS.Timeout | null>(null);

  const sendTypingEvent = useCallback(
    async (typing: boolean) => {
      if (!userId || !battleCode) return;
      const now = Date.now();
      if (typing && now - lastSent.current < 500) return;

      lastSent.current = now;
      await api.post("/api/battle/typing", { userId, battleCode, typing });
    },
    [userId, battleCode]
  );

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);

      if (!userId || !battleCode) return;

      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

      if (!throttleTimeout.current) {
        sendTypingEvent(true);
        throttleTimeout.current = setTimeout(() => {
          throttleTimeout.current = null;
        }, 500);
      }
      debounceTimeout.current = setTimeout(() => sendTypingEvent(false), 2000);
    },
    [sendTypingEvent]
  );

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  }, [charCount]);

  return (
    <motion.div className="relative flex flex-col text-white w-full">
      {label && (
        <motion.label
          className={`absolute left-3 sm:left-4 transition-all duration-300 text-sm sm:text-base font-semibold ${
            isFocused || charCount > 0 ? "top-1 sm:top-2 text-xs sm:text-sm text-cyan-300" : "top-1/2 -translate-y-1/2 text-gray-400"
          }`}
        >
          {label}
        </motion.label>
      )}

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
        disabled={disabled}
        autoFocus
        className={`pt-6 sm:pt-8 p-3 sm:p-4 border-2 border-gray-600/40 backdrop-blur-md rounded-lg text-gray-700 placeholder-gray-400 
          focus:outline-none focus:ring-4 focus:ring-cyan-400 focus:text-gray-900 focus:border-cyan-400 transition-all duration-300 ${
            disabled ? "bg-gray-500 text-gray-300 cursor-not-allowed" : "bg-white text-black"
          } 
          text-sm sm:text-base min-h-[100px] sm:min-h-[120px] max-h-[300px] overflow-y-auto ${className}`}
      />

      <motion.div
        className={`absolute bottom-2 right-3 text-xs sm:text-sm transition-all duration-300 ${
          charCount >= maxLength ? "text-red-400" : charCount >= maxLength * 0.9 ? "text-yellow-400" : "text-gray-400"
        }`}
      >
        {charCount}/{maxLength}
      </motion.div>

      {error && (
        <motion.div className="text-white text-xs sm:text-sm mt-1 sm:mt-2 font-medium shadow-[0_0_5px_rgba(248,113,113,0.3)]">
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default TextareaField;