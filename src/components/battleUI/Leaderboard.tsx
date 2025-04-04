import { useEffect, useMemo, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Howl } from "howler";
import TypingIndicator from "./TypingIndicator";
import Image from "next/image";
import { useSession } from "next-auth/react";

interface Player {
  userId: string;
  score: number;
  name: string;
  isTyping?: boolean;
  avatar?: string;
}

const celebrationSound = new Howl({
  src: ["/rankbgm.mp3"],
  volume: 0.8,
  onend: () => celebrationSound.stop(),
});

const ConfettiEffect = memo(() => {
  const confettiPieces = new Array(12).fill(0);
  const shapes = ["w-2 h-2", "w-2 h-3", "w-3 h-3", "w-2 h-2 rounded-full"];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((_, i) => {
        const x = Math.random() * 100;
        const delay = Math.random();
        const rotation = Math.random() * 360;
        const shape = shapes[Math.floor(Math.random() * shapes.length)];

        return (
          <motion.div
            key={i}
            className={`absolute ${shape}`}
            style={{
              left: `${x}%`,
              backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
            }}
            initial={{ y: -10, opacity: 1, rotate: rotation }}
            animate={{ y: "100vh", opacity: [1, 1, 0], rotate: rotation + 1080 }}
            transition={{ duration: 2.5, delay }}
          />
        );
      })}
    </div>
  );
});

interface LeaderboardProps {
  players: Player[];
}

export default memo(function Leaderboard({ players }: LeaderboardProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [prevTopPlayer, setPrevTopPlayer] = useState<string | null>(null);
  const { data: session } = useSession()
  const currentUserId = session?.user?.id
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [players]);

  useEffect(() => {
    if (sortedPlayers.length > 0 && sortedPlayers[0]?.userId !== prevTopPlayer) {
      triggerConfetti();
      celebrationSound.play();
      setPrevTopPlayer(sortedPlayers[0]?.userId);
    }
  }, [sortedPlayers]);

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1500);
  };

  return (
    <div className="relative mt-6 w-full max-w-2xl mx-auto p-5 sm:p-6 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold text-center text-white mb-4">🏆 Leaderboard</h2>
      <AnimatePresence>{showConfetti && <ConfettiEffect />}</AnimatePresence>
      <div className="space-y-3">
        <AnimatePresence>
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.userId}
              layoutId={player.userId}
              className={`flex items-center p-3 sm:p-4 rounded-lg shadow-md transition-all gap-4 
                hover:scale-[1.02] hover:shadow-xl duration-300
                ${
                  index === 0
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black animate-pulse"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-400 to-gray-600 text-black"
                    : index === 2
                    ? "bg-gradient-to-r from-orange-400 to-orange-600 text-black"
                    : "bg-gray-800 text-white"
                }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              layout
            >
              <div
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden 
                  ${index < 3 ? "border-4 border-white animate-glow" : ""}`}
              >
                {player.avatar ? (
                  <Image
                    src={player.avatar}
                    alt={`${player.name}'s avatar`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-lg font-bold">
                    {player.name ? player.name[0].toUpperCase() : "U"}
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-base sm:text-lg">
                    {index + 1}. {player.name}
                  </span>
                  {player.userId !== currentUserId && player.isTyping && <TypingIndicator />}
                </div>
                <motion.span
                  key={player.userId}
                  animate={{ scale: [1, 1.2, 1], color: "#ff0" }}
                  transition={{ duration: 0.5 }}
                  className="font-bold text-base sm:text-lg"
                >
                  {player.score || 0} pts
                </motion.span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
});