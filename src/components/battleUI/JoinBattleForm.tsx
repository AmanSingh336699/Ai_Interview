"use client";

import { memo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Loader from "@/components/ui/Loader";
import { FaSignInAlt, FaKey, FaUser } from "react-icons/fa";
import { useSession } from "next-auth/react";

const joinSchema = z.object({
  battleCode: z.string().min(6, "Battle Code must be at least 6 characters long"),
  playerName: z.string().min(3, "Name must be at least 3 characters long"),
});

type JoinFormType = z.infer<typeof joinSchema>;

function JoinBattleForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<JoinFormType>({
    resolver: zodResolver(joinSchema),
  });

  useEffect(() => {
    if (session?.user?.name) {
      setValue("playerName", session.user.name);
    }
  }, [session, setValue]);

  const onSubmit = async (data: JoinFormType) => {
    try {
      const res = await api.post(`/api/battle/join`, {
        userId: session?.user?.id,
        battleCode: data.battleCode,
        name: data.playerName,
      });
      if (res.status === 200) {
        router.push(`/battleHome/lobby/${data.battleCode}`);
      } else {
        alert(res.data.message || "Failed to join the battle.");
      }
    } catch (error) {
      console.error("Join Battle Error:", error);
      alert("Could not join the battle. Please check the code and try again.");
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-md bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl space-y-6 border border-white/20 text-white"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        className="text-3xl font-bold text-center mb-4 tracking-wide"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        🔥 Join the Battle 🔥
      </motion.h2>

      <div className="relative">
        <label className="block text-sm font-semibold text-gray-300">Your Name</label>
        <div className="relative w-full">
          <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={session?.user?.name || ""}
            disabled
            className="w-full p-3 pl-10 mt-1 rounded-lg bg-gray-700/50 text-gray-300 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-semibold text-gray-300">Battle Code</label>
        <div className="relative w-full">
          <FaKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            {...register("battleCode")}
            className="w-full p-3 pl-10 mt-1 rounded-lg bg-gray-100 text-black focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300"
            placeholder="Enter Battle Code"
          />
        </div>
        {errors.battleCode && (
          <motion.p
            className="text-red-400 text-xs mt-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {errors.battleCode.message}
          </motion.p>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-green-400 to-blue-500 px-6 py-3 rounded-lg text-white font-semibold hover:from-green-500 hover:to-blue-600 flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-green-500/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSubmitting ? (
          <Loader size={24} button={true} />
        ) : (
          <>
            <FaSignInAlt className="mr-2" /> Join Battle
          </>
        )}
      </motion.button>
    </motion.form>
  );
}

export default memo(JoinBattleForm);