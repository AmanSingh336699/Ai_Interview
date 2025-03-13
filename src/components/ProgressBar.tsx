import { motion } from "framer-motion";
import { JSX } from "react";

interface ProgressBarProps {
  title: string;
  value: number;
  max: number;
  icon: JSX.Element;
}

const ProgressBar = ({ title, value, max, icon }: ProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  const getColor = (score: number) => {
    if (score >= 80) return "bg-green-400";
    if (score >= 50) return "bg-yellow-400"; 
    return "bg-red-500";
  };

  return (
    <motion.div className="mt-6 p-4 w-full bg-gray-800/20 rounded-lg shadow-md" whileHover={{ scale: 1.02 }}>
      <p className="text-white text-lg font-bold mb-2 flex items-center">{icon}{title}:</p>
      <div className="relative w-full h-6 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute h-full ${getColor(percentage)} rounded-full`}
          initial={{ width: "0%" }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
      <p className="mt-2 text-center text-xl font-semibold text-white">{value}/{max}</p>
    </motion.div>
  );
};

export default ProgressBar;