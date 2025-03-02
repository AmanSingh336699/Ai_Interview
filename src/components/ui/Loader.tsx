"use client"
import { memo } from "react";
import { motion } from "framer-motion";

interface LoaderProps {
  size?: number;
  button?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ size = 64, button = false }) => {
  return (
    <motion.div
      className={`flex justify-center items-center ${button ? "" : "h-screen"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="rounded-full border-t-4 border-sky-500 shadow-lg"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
          boxShadow: [
            "0px 0px 10px rgba(0, 174, 255, 0.5)",
            "0px 0px 20px rgba(0, 174, 255, 0.8)",
            "0px 0px 10px rgba(0, 174, 255, 0.5)"
          ]
        }}
        transition={{
          rotate: { repeat: Infinity, duration: 0.8, ease: "linear" },
          scale: { repeat: Infinity, duration: 1, ease: "easeInOut" },
          boxShadow: { repeat: Infinity, duration: 1, ease: "easeInOut" }
        }}
        style={{
          height: size,
          width: size,
          borderWidth: size / 8,
          borderColor: "rgba(0, 174, 255, 1) transparent transparent transparent",
          borderRadius: "50%"
        }}
      />
    </motion.div>
  );
};

export default memo(Loader);
