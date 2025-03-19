"use client";

import { useCallback, useEffect, useReducer } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FaCheckCircle, FaLightbulb, FaPaperPlane, FaQuestionCircle } from "react-icons/fa";
import TextareaField from "@/components/TextareaField";
import Loader from "@/components/ui/Loader";
import Funny from "@/components/ui/Funny";
import WordSkeleton from "@/components/ui/WordSkeleton";
import KeyboardShortcut from "@/components/KeyBoardShortcut";
import { withAuth } from "@/components/withAuth";

const answerSchema = z.object({
  answer: z.string().min(5, "Answer must be at least 5 characters"),
});

type AnswerFormType = z.infer<typeof answerSchema>;

interface State {
  question: string;
  currentIndex: number;
  hint: string;
  totalHints: number;
  usedHints: Record<string, boolean>;
  completed: boolean;
  funnyMessage: string | null;
  isQuestionLoading: boolean,
  isHintLoading: boolean,
}

const initialState: State = {
  question: "",
  currentIndex: 0,
  hint: "",
  totalHints: 3,
  usedHints: {},
  completed: false,
  funnyMessage: null,
  isQuestionLoading: false,
  isHintLoading: false,
};

type Action =
  | { type: "SET_QUESTION"; payload: { question: string; currentIndex: number } }
  | { type: "SET_HINT"; payload: string }
  | { type: "USE_HINT"; payload: string }
  | { type: "SET_FUNNY"; payload: string | null }
  | { type: "SET_COMPLETED" }
  | { type: "SET_QUESTION_LOADING"; payload: boolean }
  | { type: "SET_HINT_LOADING"; payload: boolean };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_QUESTION":
      return { ...state, ...action.payload, hint: "", isQuestionLoading: false };
    case "SET_HINT":
      return { ...state, hint: action.payload, isHintLoading: false };
    case "USE_HINT":
      return {
        ...state,
        hint: action.payload,
        totalHints: state.totalHints - 1,
        usedHints: { ...state.usedHints, [state.question]: true },
        isHintLoading: false,
      };
    case "SET_FUNNY":
      return { ...state, funnyMessage: action.payload };
    case "SET_COMPLETED":
      return { ...state, completed: true };
    case "SET_QUESTION_LOADING":
      return { ...state, isQuestionLoading: action.payload };
    case "SET_HINT_LOADING":
      return { ...state, isHintLoading: action.payload }
    default:
      return state;
  }
};

function InterviewProcess() {
  const { id } = useParams();
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { register, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<AnswerFormType>({
    defaultValues: { answer: "" },
    resolver: zodResolver(answerSchema),
  });

  useEffect(() => {
    const controller = new AbortController();
    const fetchQuestions = async () => {
      dispatch({ type: "SET_QUESTION_LOADING", payload: true });
      try {
        const res = await api.get(`/api/interview/question?interviewId=${id}`, { signal: controller.signal });
        dispatch({ type: "SET_QUESTION", payload: { question: res.data.question, currentIndex: res.data.currentIndex } });
      } catch (error: any) {
        if (!controller.signal.aborted) toast.error(error.response?.data?.message || "Failed to load question");
      } finally {
        dispatch({ type: "SET_QUESTION_LOADING", payload: false });
      }
    };
    fetchQuestions();
    return () => controller.abort();
  }, [id]);

  const requestHint = useCallback(async () => {
    if (state.totalHints === 0 || state.usedHints[state.question]) return;
    dispatch({ type: "SET_HINT_LOADING", payload: true });
    try {
      const res = await api.post("/api/interview/hint", { question: state.question });
      dispatch({ type: "USE_HINT", payload: res.data.hint });
      toast.success("Hint unlocked!");
    } catch (error) {
      toast.error("Failed to get hint");
    } finally {
      dispatch({ type: "SET_HINT_LOADING", payload: false });
    }
  }, [state.question, state.totalHints, state.usedHints]);

  const submitAnswer = useCallback(async (data: AnswerFormType) => {
    try {
      const res = await api.post("/api/interview/answer", { interviewId: id, question: state.question, answer: data.answer });
      if (res.data.comment) {
        dispatch({ type: "SET_FUNNY", payload: res.data.comment });
      } else {
        dispatch({ type: "SET_QUESTION", payload: { question: res.data.nextQuestion, currentIndex: res.data.nextIndex } });
        dispatch({ type: "SET_HINT", payload: "" });
        setValue("answer", "");
      }
      if (res.data.status === "completed") {
        dispatch({ type: "SET_COMPLETED" });
        router.push(`/summery/${id}`);
        toast.success("Interview Completed!", {
          duration: 3000,
          position: "top-center",
          icon: <FaCheckCircle className="h-6 w-6 text-emerald-500" />
        });
      } else {
        toast.success("Answer Submitted!", {
          duration: 2000,
          position: "top-center",
          icon: <FaPaperPlane className="h-6 w-6 text-sky-500" />
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit answer");
    }
  }, [id, state.question, router, setValue]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLTextAreaElement) return;
      event.preventDefault();
      if (event.key === "Enter") handleSubmit(submitAnswer)();
      if (event.key === " ") requestHint();
      if (event.key === "Escape") setValue("answer", "");
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleSubmit, submitAnswer, requestHint, setValue]);

  const handleFunnyClose = useCallback(async () => {
    dispatch({ type: "SET_FUNNY", payload: null });
    dispatch({ type: "SET_QUESTION_LOADING", payload: true });
    try {
      const res = await api.get(`/api/interview/question?interviewId=${id}`);
      dispatch({ type: "SET_QUESTION", payload: { question: res.data.question, currentIndex: res.data.currentIndex } });
      dispatch({ type: "SET_HINT", payload: "" });
      setValue("answer", "");
    } catch (error) {
      toast.error("Failed to fetch next question");
    } finally {
      dispatch({ type: "SET_QUESTION_LOADING", payload: false });
    }
  }, [id, setValue]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white py-8 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <motion.h1
        className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6 sm:mb-8 flex items-center text-white drop-shadow-lg"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
      >
        <FaQuestionCircle className="mr-2 sm:mr-3 text-cyan-300 text-xl sm:text-2xl" /> AI Interview
      </motion.h1>

      <AnimatePresence mode="wait">
        {state.completed ? (
          <motion.div
            key="completed"
            className="text-center bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-md sm:max-w-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <motion.p className="text-lg sm:text-xl md:text-2xl text-emerald-400 flex items-center justify-center gap-2">
              <FaCheckCircle className="text-emerald-400 text-xl sm:text-2xl" /> Interview Completed!
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="interview"
            className="w-full max-w-md sm:max-w-lg md:max-w-2xl space-y-4 sm:space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {state.isQuestionLoading ? (
              <p className="text-base sm:text-lg text-gray-200 text-center animate-pulse">Loading interview...</p>
            ) : state.isQuestionLoading ? (
              <WordSkeleton height="60px" width="100%" className="rounded-lg" />
            ) : (
              <motion.div
                className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-white/20"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, type: "spring" }}
              >
                <p className="text-base sm:text-lg md:text-xl text-white flex items-center gap-2">
                  <FaQuestionCircle className="text-cyan-300 text-lg sm:text-xl" /> {state.question}
                </p>
                <p className="mt-2 text-sm sm:text-base text-gray-300">{state.currentIndex + 1} of 10 questions</p>
              </motion.div>
            )}

            {state.totalHints > 0 && !state.usedHints[state.question] && (
              <motion.div
                className="w-full"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              >
                {state.isHintLoading ? (
                  <WordSkeleton height="48px" width="100%" className="rounded-lg" />
                ) : (
                  <motion.button
                    onClick={requestHint}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-300"
                    whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(234, 179, 8, 0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <FaLightbulb className="text-white text-lg sm:text-xl" /> Ask Hint ({state.totalHints} left)
                  </motion.button>
                )}
              </motion.div>
            )}

            {state.hint && !state.isHintLoading && (
              <motion.div
                className="bg-yellow-500/10 p-3 sm:p-4 rounded-lg border border-yellow-500/30"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              >
                <p className="text-sm sm:text-base md:text-lg text-yellow-300 flex items-center gap-2">
                  <FaLightbulb className="text-yellow-300 text-lg sm:text-xl" /> {state.hint}
                </p>
              </motion.div>
            )}

            {state.funnyMessage && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Funny message={state.funnyMessage} onClose={handleFunnyClose} />
              </motion.div>
            )}

            <form onSubmit={handleSubmit(submitAnswer)} className="space-y-3 sm:space-y-4">
              <TextareaField
                label="Your Answer"
                register={register("answer")}
                error={errors.answer?.message}
                className="w-full"
              />
              <KeyboardShortcut />
              <motion.button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-md flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isSubmitting || state.isQuestionLoading}
                whileHover={{ scale: 1.03, boxShadow: "0 0 15px rgba(16, 185, 129, 0.5)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <FaPaperPlane className="text-lg sm:text-xl" />
                {isSubmitting ? <Loader size={24} button={true} /> : "Submit Answer"}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default withAuth(InterviewProcess);