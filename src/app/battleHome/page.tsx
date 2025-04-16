"use client"

import BattleLayout from "@/components/layouts/BattleLayout";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import CreateBattleForm from "@/components/battleUI/CreateBattleForm";
import JoinBattleForm from "@/components/battleUI/JoinBattleForm";

export default function BattleHome() {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  return (
    <BattleLayout>
      <header className="relative z-10 text-center mb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400 animate-pulse">
          Battle Arena
        </h1>
        <p className="mt-3 text-lg md:text-xl text-gray-300">
          Challenge your friends and prove your skills!
        </p>
        <div className="mt-6">
          <ToggleSwitch activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </header>

      <main className="relative z-10 w-full flex justify-center">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg">
          <AnimatePresence mode="wait">
            {activeTab === "create" ? (
              <motion.div
                key="create"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <CreateBattleForm />
              </motion.div>
            ) : (
              <motion.div
                key="join"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <JoinBattleForm />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </BattleLayout>
  );
}