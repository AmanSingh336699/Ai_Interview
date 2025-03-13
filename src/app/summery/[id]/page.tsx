"use client";

import { useState, useEffect, useCallback, useMemo, JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import Loader from "@/components/ui/Loader";
import { withAuth } from "@/components/withAuth";
import ProgressBar from "@/components/ProgressBar";
import { FaExclamationCircle, FaHome, FaStar, FaTrophy, FaPercentage } from "react-icons/fa";


interface Feedback {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  comment: string;
  selectionChance: string;
}

interface InterviewSummary {
  response: { score: number }[];
  feedback: Feedback;
}

function InterviewSummary() {
  const { id } = useParams();
  const router = useRouter();
  const [summary, setSummary] = useState<InterviewSummary | null>(null);
  const [loading, setLoading] = useState(true);

const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get(`/api/interview/summary?interviewId=${id}`);
      setSummary(res.data.interview);
    } catch (error) {
      console.error("Error fetching interview summary:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const finalScore = useMemo(
    () => summary?.response?.reduce((total, current) => total + current.score, 0) || 0,
    [summary]
  );

  const selectionChance = useMemo(
    () => (summary?.feedback?.selectionChance ? parseInt(summary.feedback.selectionChance.replace("%", "")) : 0),
    [summary]
  )

  return (
    <motion.div
      className="p-6 min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-2xl sm:text-4xl font-bold mb-6 flex items-center drop-shadow-lg text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FaTrophy className="mr-3 text-yellow-400" />
        Interview Summary
      </motion.h1>

      {loading ? (
        <div className="flex flex-col items-center">
          <p>Loading AI Feedback...</p>
          <Loader size={24} />
        </div>
      ) : summary ? (
        <motion.div
          className="w-full max-w-3xl bg-white/10 p-6 rounded-lg shadow-lg backdrop-blur-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProgressBar title="Final Score" value={finalScore} max={100} icon={<FaStar className="mr-2 text-yellow-300" />} />
          <ProgressBar title="Selection Chances" value={selectionChance} max={100} icon={<FaPercentage className="mr-2 text-purple-300" />} />
          <SummarySection title="Strengths" icon={<FaTrophy className="mr-2" />} color="emerald" items={summary.feedback?.strengths} />
          <SummarySection title="Weaknesses" icon={<FaExclamationCircle className="mr-2" />} color="rose" items={summary.feedback?.weaknesses} />
          <SummarySection title="Improvements" icon={<FaTrophy className="mr-2" />} color="sky" items={summary.feedback?.improvements} />
          <motion.div className="mt-4 p-4 rounded-lg bg-amber-500/20 shadow-md" whileHover={{ scale: 1.02 }}>
            <p className="text-amber-300 flex items-center font-bold mb-2">
              <FaTrophy className="mr-2" />
              AI Comment:
            </p>
            <p className="text-white">{summary.feedback?.comment || "N/A"}</p>
          </motion.div>

          <motion.button
            onClick={() => router.push("/dashboard")}
            className="mt-6 px-6 py-3 bg-fuchsia-500 hover:bg-fuchsia-400 transition-all duration-200 rounded-lg w-full text-white flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaHome className="mr-2" />
            Dashboard
          </motion.button>
        </motion.div>
      ) : (
        <p className="text-lg">No data available.</p>
      )}
    </motion.div>
  );
}

const SummarySection = ({ title, icon, color, items }: { title: string; icon: JSX.Element; color: string; items: string[] }) => (
  <motion.div className={`mt-4 p-4 rounded-lg bg-${color}-500/20 shadow-md`} whileHover={{ scale: 1.02 }}>
    <p className={`text-${color}-300 flex items-center font-bold mb-2`}>{icon}{title}:</p>
    <ul className="text-white list-disc list-inside">
      {items?.length > 0 ? items.map((item, index) => <li key={index}>{item}</li>) : <li>N/A</li>}
    </ul>
  </motion.div>
);

export default withAuth(InterviewSummary);