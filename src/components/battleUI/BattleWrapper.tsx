"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { pusherClient } from "@/utils/config";
import api from "@/lib/api";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { FaUser } from "react-icons/fa";

interface Player {
  userId: string;
  score?: number;
  name: string;
  isTyping?: boolean;
}

interface BattleWrapperProps {
  battleCode: string;
  children: (data: {
    question: string;
    currentIndex: number;
    players: Player[];
    status: string;
    gameState: { hasAnswered: boolean; resetForm: boolean };
    setGameState: React.Dispatch<React.SetStateAction<{ hasAnswered: boolean; resetForm: boolean }>>;
  }) => JSX.Element;
}

interface Member {
  id: string;
  info?: {
    name?: string;
  };
}

export default function BattleWrapper({ battleCode, children }: BattleWrapperProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [question, setQuestion] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [players, setPlayers] = useState<Player[]>([]);
  const [status, setStatus] = useState("ongoing");
  const [gameState, setGameState] = useState({ hasAnswered: false, resetForm: false });

  const fetchData = useCallback(async () => {
    if (!battleCode || !userId) return;

    try {
      const [questionRes, answerRes] = await Promise.all([
        api.get(`/api/battle/question?battleCode=${battleCode}`),
        api.get<{ hasAnswered: boolean }>(`/api/battle/has-answered?battleCode=${battleCode}&userId=${userId}`),
      ]);

      if (questionRes.data.error === "Battle finished") {
        setStatus("completed");
        return;
      }

      setQuestion(questionRes.data.question);
      setCurrentIndex(questionRes.data.currentIndex);
      setStatus(questionRes.data.status);
      setGameState((prev) => ({ ...prev, hasAnswered: answerRes?.data?.hasAnswered || false }));
      setPlayers(questionRes.data.players.map((p: Player) => ({ ...p, isTyping: false })));
    } catch (error) {
      setGameState((prev) => ({ ...prev, hasAnswered: false }));
    }
  }, [battleCode, userId,  currentIndex]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!battleCode || !userId) return;

    const channel = pusherClient.subscribe(`presence-battle-${battleCode}`);

    const handleSubscriptionSucceeded = (members: any) => {
      if (!members || !members.members) return;
      const initialPlayers = Object.entries(members.members).map(([key, value]: [string, any]) => ({
        userId: key,
        name: typeof value.name === "string" ? value.name : "Unknown",
        isTyping: false,
      }));
      setPlayers((prev) =>
        prev.map((p) => {
          const updatedPlayer = initialPlayers.find((play) => play.userId === p.userId);
          return updatedPlayer ? { ...p, name: updatedPlayer.name } : p;
        })
      );
      const userName = initialPlayers.find((p) => p.userId === userId)?.name || "You";
      toast.success(`${userName} have joined the battle!`, {
        duration: 3000,
        position: "top-center",
        icon: <FaUser className="h-6 w-6 text-sky-500" />,
        style: { background: "#4caf50", color: "#fff" },
      });
    };

    const handleMemberAdded = (member: Member) => {
      setPlayers((prev) => {
        if (prev.some((p) => p.userId === member.id)) return prev;
        const newPlayer = { userId: member.id, name: member.info?.name || "Unknown", isTyping: false };
        toast.success(`${newPlayer.name} has joined the battle!`, {
          duration: 3000,
          position: "top-center",
          icon: <FaUser className="h-6 w-6 text-sky-500" />,
          style: { background: "#4caf50", color: "#fff" },
        });
        return [...prev, newPlayer];
      });
    };

    const handleMemberRemoved = (member: Member) => {
      setPlayers((prev) => prev.filter((p) => p.userId !== member.id));
      toast(`${member.info?.name || "Unknown"} has left the battle!`, {
        duration: 3000,
        position: "top-center",
        icon: "👋",
        style: { background: "#ff4d4f", color: "#fff" },
      });
    };

    const handleScoreUpdated = (data: { players: Player[] }) => {
      setPlayers(
        data.players.map((player) => ({
          ...player,
          name: player.name || "Unknown",
          isTyping: players.find((p) => p.userId === player.userId)?.isTyping || false,
        }))
      );
    };

    const handleNextQuestion = (data: { currentQuestionIndex: number; question: string; status: string }) => {
      setCurrentIndex(data.currentQuestionIndex);
      setQuestion(data.question);
      setStatus(data.status);
      setGameState({ hasAnswered: false, resetForm: true });
    };

    const handleBattleCompleted = () => setStatus("completed");

    const handleTypingEvent = (data: { userId: string; typing: boolean }) => {
      if (data.userId === userId) return;
      setPlayers((prev) =>
        prev.map((p) => (p.userId === data.userId ? { ...p, isTyping: data.typing } : p))
      );
    };

    channel.bind("pusher:subscription_succeeded", handleSubscriptionSucceeded);
    channel.bind("pusher:member_added", handleMemberAdded);
    channel.bind("pusher:member_removed", handleMemberRemoved);
    channel.bind("score-updated", handleScoreUpdated);
    channel.bind("next-question", handleNextQuestion);
    channel.bind("battle-completed", handleBattleCompleted);
    channel.bind("typing-event", handleTypingEvent);

    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe(`presence-battle-${battleCode}`);
    };
  }, [battleCode, userId, players]);

  const playerList = useMemo(() => players, [players]);

  return children({
    question,
    currentIndex,
    players: playerList,
    status,
    gameState,
    setGameState,
  });
} 

