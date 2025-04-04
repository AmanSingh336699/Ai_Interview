"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { pusherClient } from "@/utils/config";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/ui/Loader";
import BattleLayout from "@/components/layouts/BattleLayout";
import { HiClipboardCopy, HiOutlineClipboardCopy } from "react-icons/hi";
import toast from "react-hot-toast";

interface Player {
  userId: string;
  name: string;
  avatar?: string;
}

interface BattleDetails {
  topic: string;
  difficulty: string;
}

const BattleLobby = memo(() => {
  const { battleCode } = useParams();
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [battleDetails, setBattleDetails] = useState<BattleDetails>({
    topic: "",
    difficulty: "",
  });
  const [maxPlayers, setMaxPlayers] = useState(0);
  const [status, setStatus] = useState<string>("waiting");
  const [isCopied, setIsCopied] = useState(false);

  const fetchBattleData = async (retryCount = 0) => {
    try {
      const res = await api.get(`/api/battle/lobby?battleCode=${battleCode}`);
      setPlayers(res.data.players);
      setMaxPlayers(res.data.maxPlayers);
      setStatus(res.data.status);
      setBattleDetails(res.data.battleDetails);
      setLoading(false);
      console.log("players: ",players)
    } catch (error) {
      if (retryCount < 3) {
        setTimeout(() => fetchBattleData(retryCount + 1), 1000);
      } else {
        toast.error("Error loading battle data. Please refresh the page.");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBattleData();
    const channel = pusherClient.subscribe(`battle-${battleCode}`);
    channel.bind("player-joined", (data: { players: Player[] }) => {
      setPlayers(data.players);
      toast.success(`🎉 ${data.players[data.players.length - 1].name} joined the battle!`);
    });

    channel.bind("battle-started", () => {
      toast.success("🚀 Battle is starting!");
      router.push(`/battleHome/play/${battleCode}`);
    });

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`battle-${battleCode}`);
    };
  }, [battleCode, router]);

  useEffect(() => {
    if (status === "ongoing") {
      toast.success("🚀 Battle is starting!");
      setTimeout(() => router.push(`/battleHome/play/${battleCode}`), 1000);
    }
  }, [status, battleCode, router]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(battleCode as string).then(() => {
      setIsCopied(true);
      toast.success("Battle code copied!");
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => toast.error("Failed to copy code"));
  }, [battleCode]);

  return (
    <BattleLayout>
      <motion.div
        className="bg-white/10 backdrop-blur-lg shadow-2xl rounded-lg p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg border border-white/20 mx-auto"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4"
          animate={{ scale: [1, 1.05, 1] }}
        >
          Battle Lobby ⚔️
        </motion.h1>

        <motion.div
          className="mb-4 sm:mb-6 p-3 sm:p-4 bg-black/20 border border-yellow-400 rounded-lg text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm sm:text-lg font-semibold text-white">
            🔥 Battle Topic: <span className="text-yellow-300">{battleDetails.topic}</span>
          </p>
          <p className="text-xs sm:text-md text-gray-300">
            🎯 Difficulty: <span className="text-red-400 font-medium">{battleDetails.difficulty}</span>
          </p>
        </motion.div>

        <div className="text-center mb-4 sm:mb-6">
          <p className="text-sm sm:text-lg font-medium">
            Players Joined: {players.length}/{maxPlayers}
          </p>
          <div className="w-full bg-white/20 h-2 rounded-full mt-2">
            <motion.div
              className="bg-yellow-400 h-2 rounded-full"
              animate={{ width: `${(players.length / maxPlayers) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <motion.div
          className="mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <label className="block text-xs sm:text-sm text-gray-300 mb-1">Battle Code</label>
          <div className="flex shadow-lg rounded-lg overflow-hidden">
            <input
              type="text"
              value={battleCode as string}
              disabled
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="outline-none w-full py-2 px-3 bg-white/10 border border-white/30 text-white font-mono text-xs sm:text-sm"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:bg-purple-600 px-3 sm:px-4"
            >
              {isCopied ? <HiClipboardCopy size={20} /> : <HiOutlineClipboardCopy size={20} />}
            </motion.button>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">Share this code with friends</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center my-6">
            <Loader size={48} />
          </div>
        ) : (
          <ul className="mt-4 sm:mt-6 space-y-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-white/10">
            <AnimatePresence>
              {players.map(({ userId, name, avatar }) => (
                <motion.li
                  key={userId}
                  className="p-3 bg-white/10 rounded-lg flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={`${name}'s profile`}
                        width={32} 
                        height={32}
                        className="rounded-full mr-2 object-cover"
                        unoptimized={avatar.startsWith("http")}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          ((e.target as HTMLImageElement).nextSibling as HTMLElement)?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center mr-2 text-white text-sm sm:text-lg ${
                        avatar ? "hidden" : ""
                      }`}
                    >
                      {name[0].toUpperCase()}
                    </div>
                    <span className="text-sm sm:text-lg truncate">{name}</span>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        <motion.p
          className="text-center mt-4 sm:mt-6 text-sm sm:text-lg text-gray-300"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Battle will start automatically when all players join!
        </motion.p>
      </motion.div>
    </BattleLayout>
  );
});

export default BattleLobby;