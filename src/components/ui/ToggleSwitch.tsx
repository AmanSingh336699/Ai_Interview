"use client";

import { motion } from "framer-motion";
import { memo } from "react";
import { FaPlus, FaSignInAlt } from "react-icons/fa";

function ToggleSwitch({ activeTab, setActiveTab }: { activeTab: "create" | "join"; setActiveTab: (tab: "create" | "join") => void }) {
  return (
    <div className="flex justify-center space-x-4">
      <motion.button
        className="relative bg-purple-700 px-6 py-2 rounded-lg font-semibold"
        onClick={() => setActiveTab("create")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {activeTab === "create" && (
          <motion.div
            layoutId="active-indicator"
            className="absolute inset-0 bg-white rounded-lg shadow-md"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className={`relative z-10 flex items-center ${activeTab === "create" ? "text-purple-600" : "text-white"}`}>
          <FaPlus className="mr-2" /> Create Battle
        </span>
      </motion.button>
      <motion.button
        className="relative bg-purple-700 px-6 py-2 rounded-lg font-semibold"
        onClick={() => setActiveTab("join")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {activeTab === "join" && (
          <motion.div
            layoutId="active-indicator"
            className="absolute inset-0 bg-white rounded-lg shadow-md"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span className={`relative z-10 flex items-center ${activeTab === "join" ? "text-purple-600" : "text-white"}`}>
          <FaSignInAlt className="mr-2" /> Join Battle
        </span>
      </motion.button>
    </div>
  );
}

export default memo(ToggleSwitch)