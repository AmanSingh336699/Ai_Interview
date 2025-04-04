"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import api from "@/lib/api";
import toast from "react-hot-toast";
import BattleLayout from "@/components/layouts/BattleLayout";
import Leaderboard from "@/components/battleUI/Leaderboard";
import { LuRefreshCw } from "react-icons/lu";
import { TbAlertTriangleFilled } from "react-icons/tb";

interface Player {
  userId: string;
  score: number;
  name: string;
  avatar?: string;
}

interface Answer {
  username: string;
  question: string;
  answer: string;
}

export default function BattleSummary() {
  const { battleCode } = useParams();
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/battle/answer?battleCode=${battleCode}`);
        if (res?.data.status === "completed") {
          if (res?.data.updatedRankAnswer && Array.isArray(res?.data.updatedRankAnswer) && res?.data.players) {
            setAnswers(res.data.updatedRankAnswer);
            setPlayers(res.data.players);
          } else {
            setError("No answers available");
          }
        } else {
          router.push(`/battleHome/play/${battleCode}`);
        }
      } catch (err) {
        setError("Failed to fetch answers");
        toast.error("Failed to fetch ranked answers");
      } finally {
        setLoading(false);
      }
    };

    if (battleCode) fetchAnswers();
  }, [battleCode, router]);

  const formattedPlayers = useMemo(
    () => players.map((player) => ({ ...player, score: player.score ?? 0 })),
    [players]
  );

  if (loading) {
    return (
      <BattleLayout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-600 to-green-600">
          <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-t-4 border-white border-solid"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
              className="mt-6 text-white text-lg sm:text-xl md:text-2xl font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Loading Battle Summary...
            </motion.p>
          </motion.div>
        </div>
      </BattleLayout>
    );
  }

  if (error) {
    return (
      <BattleLayout>
        <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-600 to-orange-600">
          <motion.div
            className="flex flex-col items-center text-center p-4 sm:p-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, yoyo: Infinity }}
            >
              <TbAlertTriangleFilled className="text-white h-16 w-16 sm:h-20 sm:w-20 mb-4" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Oops! Something Went Wrong</h2>
            <p className="text-white text-base sm:text-lg md:text-xl mb-6">{error}</p>
            <motion.button
              onClick={() => window.location.reload()}
              className="flex items-center bg-white text-red-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-lg hover:bg-gray-100 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LuRefreshCw className="mr-2 h-5 w-5 sm:h-6 sm:w-6" /> Retry
            </motion.button>
          </motion.div>
        </div>
      </BattleLayout>
    );
  }

  return (
    <BattleLayout>
      <div className="container mx-auto p-4 sm:p-6 md:p-8">
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 drop-shadow-lg text-center mb-8 sm:mb-10 md:mb-12"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          🎉 Battle Completed!
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-4 md:mb-6">Leaderboard</h2>
            <Leaderboard players={formattedPlayers} />
          </motion.div>

          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 mb-4 md:mb-6">🏆 Top Ranked Answers</h2>
            <div className="flex flex-col gap-4 sm:gap-6">
              {answers.map((answer, index) => {
                const rank = index + 1;
                let borderClass = "";
                if (rank === 1) borderClass = "border-yellow-500 border-2";
                else if (rank === 2) borderClass = "border-gray-400 border-2";
                else if (rank === 3) borderClass = "border-amber-600 border-2";
                else borderClass = "border-gray-300";

                const player = players.find((p) => p.name === answer.username);

                return (
                  <motion.div
                    key={index}
                    className={`bg-white/95 p-4 sm:p-6 rounded-xl shadow-md hover:shadow-xl backdrop-blur-md transition-all duration-300 ${borderClass}`}
                    whileHover={{ scale: 1.03 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex items-center mb-4">
                      {player?.avatar ? (
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full mr-4 shadow-md overflow-hidden">
                          <Image
                            src={player.avatar}
                            alt={player.name}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-full flex justify-center items-center text-xl sm:text-2xl font-bold text-white mr-4 shadow-md">
                          {answer.username.charAt(0)}
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">{answer.username}</h3>
                      <span className="ml-auto text-xl sm:text-2xl md:text-3xl font-bold text-gray-500">#{rank}</span>
                    </div>
                    <h4 className="text-base sm:text-lg md:text-xl text-blue-600 font-semibold">Q: {answer.question}</h4>
                    <p className="mt-2 text-gray-700 text-sm sm:text-base md:text-lg">A: {answer.answer}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <motion.button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Go to Dashboard
          </motion.button>
        </div>
      </div>
    </BattleLayout>
  );
}