"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Loader from "@/components/ui/Loader";
import { memo } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const battleSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  maxPlayers: z
    .number()
    .min(2, "At least 2 players are required")
    .max(10, "Maximum 10 players allowed")
    .refine((value) => value > 0, { message: "Max Players must be greater than zero" }),
});

type BattleFormType = z.infer<typeof battleSchema>;

function CreateBattleForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BattleFormType>({
    resolver: zodResolver(battleSchema),
  });

  const { data: session } = useSession();
  const userId = session?.user.id;

  const onSubmit = async (data: BattleFormType) => {
    try {
      const res = await api.post("/api/battle/create", {
        ...data,
        userId,
        name: session?.user.name,
      });

      router.push(`/battleHome/lobby/${res.data.battleCode}`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start battle!");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg space-y-6 border border-gray-700/40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-white text-2xl font-bold text-center flex items-center justify-center">
        🚀 Create a Battle
      </h2>

      <div className="relative">
        <label className="block text-sm font-semibold text-gray-300">Topic</label>
        <input
          {...register("topic")}
          className="w-full p-3 mt-1 rounded-lg bg-gray-800/60 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
          placeholder="e.g., React, JavaScript"
        />
        {errors.topic && <p className="text-red-400 text-xs mt-1">{errors.topic.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300">Difficulty</label>
        <select
          {...register("difficulty")}
          className="w-full p-3 mt-1 rounded-lg bg-gray-800/60 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-300">Max Players</label>
        <input
          type="number"
          {...register("maxPlayers", { valueAsNumber: true })}
          className="w-full p-3 mt-1 rounded-lg bg-gray-800/60 text-gray-200 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
        />
        {errors.maxPlayers && <p className="text-red-400 text-xs mt-1">{errors.maxPlayers.message}</p>}
      </div>

      <motion.button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-3 rounded-lg text-white font-semibold hover:from-indigo-600 hover:to-blue-700 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/50"
        disabled={isSubmitting}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSubmitting ? <Loader size={24} button={true} /> : "🚀 Start Battle"}
      </motion.button>
    </motion.form>
  );
}

export default memo(CreateBattleForm);