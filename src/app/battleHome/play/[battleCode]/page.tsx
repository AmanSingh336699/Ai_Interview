"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import TextareaField from "@/components/TextareaField";
import toast from "react-hot-toast";
import { FaPaperPlane, FaQuestionCircle } from "react-icons/fa";
import BattleWrapper from "@/components/battleUI/BattleWrapper";
import Leaderboard from "@/components/battleUI/Leaderboard";
import BattleLayout from "@/components/layouts/BattleLayout";
import { useCallback, useEffect, useMemo } from "react";
import api from "@/lib/api";
import WordSkeleton from "@/components/ui/WordSkeleton";
import Loader from "@/components/ui/Loader";

const answerSchema = z.object({
  answer: z.string().min(5, "Answer must contain 5 characters"),
});

type AnswerForm = z.infer<typeof answerSchema>;

export default function PlayPage() {
  const { battleCode } = useParams();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
  formState: { errors, isSubmitting },
  } = useForm<AnswerForm>({
    defaultValues: { answer: "" },
    resolver: zodResolver(answerSchema),
  });

  return (
    <BattleLayout>
      <BattleWrapper battleCode={battleCode as string}>
        {({ question, players, status, gameState, setGameState, currentIndex }) => {
          const onSubmit = useCallback(
            async (data: AnswerForm) => {
              if (!battleCode || gameState.hasAnswered || !userId) return;

              try {
                await api.post("/api/battle/answer", {
                  userId,
                  battleCode,
                  answer: data.answer,
                });

                toast.success("Answer Submitted!", {
                  duration: 3000,
                  position: "top-center",
                  icon: <FaPaperPlane className="h-6 w-6 text-sky-500" />,
                });

                setGameState((prev) => ({ ...prev, hasAnswered: true }));
              } catch (error) {
                console.error("Error submitting answer:", error);
              }
            },
            [battleCode, gameState.hasAnswered, userId]
          );

          useEffect(() => {
            if (!gameState.resetForm) return;
            setValue("answer", "");
            setGameState((prev) => ({ ...prev, resetForm: false }));
          }, [gameState.resetForm, setValue, setGameState]);

          const formattedPlayers = useMemo(
            () => players.map((player) => ({ ...player, score: player.score ?? 0 })),
            [players]
          );

          useEffect(() => {
            if (status === "completed") {
              router.push(`/battleHome/summary/${battleCode}`);
            }
          }, [status, router, battleCode]);

          return (
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <motion.div
                className="w-full md:w-2/3 p-6 bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 rounded-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h1 className="text-2xl font-bold text-center text-white">Battle: {battleCode}</h1>
                <>
                  {!question ? (
                    <WordSkeleton height="60px" width="100%" className="rounded-lg" />
                  ) : (
                    <motion.div
                      className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-white/20"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
                    >
                      <p className="text-base sm:text-lg md:text-xl text-white flex items-center gap-2">
                        <FaQuestionCircle className="text-cyan-300 text-lg sm:text-xl" /> {question}
                      </p>
                      <p className="mt-2 text-sm sm:text-base text-gray-300">
                        {currentIndex + 1} of 5 questions
                      </p>
                    </motion.div>
                  )}

                  <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
                    <TextareaField
                      register={register("answer")}
                      error={errors?.answer?.message}
                      placeholder="Type your answer here..."
                      disabled={isSubmitting || gameState.hasAnswered || status === "completed"}
                      className="bg-white/20 border border-white/30 text-white placeholder-white/50 p-3 rounded-lg focus:ring-2 focus:ring-blue-400"
                      userId={userId}
                      battleCode={battleCode as string}
                    />
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md font-bold disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                      disabled={isSubmitting || gameState.hasAnswered || status === "completed"}
                    >
                      {isSubmitting ? <Loader size={24} button={true} /> : "Submit Answer"}
                    </button>
                  </form>
                </>
              </motion.div>

              <motion.div
                className="w-full md:w-1/3 p-4 md:p-6 bg-white/10 backdrop-blur-lg shadow-lg border border-white/20 rounded-lg"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Leaderboard players={formattedPlayers} />
              </motion.div>
            </div>
          );
        }}
      </BattleWrapper>
    </BattleLayout>
  );
}


