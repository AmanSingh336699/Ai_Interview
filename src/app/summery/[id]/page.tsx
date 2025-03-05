"use client"

import Loader from "@/components/ui/Loader"
import { withAuth } from "@/components/withAuth"
import api from "@/lib/api"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { FaExclamationCircle, FaRedoAlt, FaStar, FaTrophy } from "react-icons/fa"

interface Feedback {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    comment: string;
}

interface InterviewSummary {
    response: { score: number }[];
    feedback: Feedback;
}

function InterviewSummary() {
    const { id } = useParams()
    const router = useRouter()

    const [summary, setSummary] = useState<InterviewSummary | null>(null)

    useEffect(() => {
        api.get(`/api/interview/summary?interviewId=${id}`)
            .then((res) => {
                setSummary(res.data.interview)
                console.log("Summary Response:", res.data.interview)
            })
            .catch(() => setSummary(null))
    }, [id])

    return (
        <motion.div 
            className="p-6 min-h-screen flex flex-col items-center justify-center 
            bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-600 text-white" 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <motion.h1 
                className="text-2xl sm:text-4xl font-bold mb-6 flex items-center drop-shadow-lg"
                initial={{ y: -20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ duration: 0.5 }}
            >
                <FaTrophy className="mr-3 text-yellow-400" />
                Interview Summary
            </motion.h1>

            {summary ? (
                <motion.div 
                    className="w-full max-w-2xl bg-white/10 p-6 rounded-lg shadow-lg backdrop-blur-md" 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-lg flex items-center mb-4">
                        <FaStar className="mr-2 text-yellow-300" />
                        <strong>Final Score:</strong> {summary.response?.reduce((total, current) => total + current.score, 0) || "N/A"}
                    </p>

                    <motion.div 
                        className="mt-4 p-4 rounded-lg bg-emerald-500/20 shadow-md" 
                        whileHover={{ scale: 1.02 }}
                    >
                        <p className="text-emerald-300 flex items-center font-bold mb-2">
                            <FaTrophy className="mr-2" />
                            Strengths:
                        </p>
                        <ul className="text-white list-disc list-inside">
                            {summary.feedback?.strengths?.length > 0 ? (
                                summary.feedback.strengths.map((strength, index) => (
                                    <li key={index}>{strength}</li>
                                ))
                            ) : (
                                <li>N/A</li>
                            )}
                        </ul>
                    </motion.div>

                    <motion.div 
                        className="mt-4 p-4 rounded-lg bg-rose-500/20 shadow-md" 
                        whileHover={{ scale: 1.02 }}
                    >
                        <p className="text-rose-300 flex items-center font-bold mb-2">
                            <FaExclamationCircle className="mr-2" />
                            Weaknesses:
                        </p>
                        <ul className="text-white list-disc list-inside">
                            {summary.feedback?.weaknesses?.length > 0 ? (
                                summary.feedback.weaknesses.map((weakness, index) => (
                                    <li key={index}>{weakness}</li>
                                ))
                            ) : (
                                <li>N/A</li>
                            )}
                        </ul>
                    </motion.div>

                    <motion.div 
                        className="mt-4 p-4 rounded-lg bg-sky-500/20 shadow-md" 
                        whileHover={{ scale: 1.02 }}
                    >
                        <p className="text-sky-300 flex items-center font-bold mb-2">
                            <strong>Improvements:</strong>
                        </p>
                        <ul className="text-white list-disc list-inside">
                            {summary.feedback?.improvements?.length > 0 ? (
                                summary.feedback.improvements.map((improvement, index) => (
                                    <li key={index}>{improvement}</li>
                                ))
                            ) : (
                                <li>N/A</li>
                            )}
                        </ul>
                    </motion.div>

                    <motion.div 
                        className="mt-4 p-4 rounded-lg bg-amber-500/20 shadow-md" 
                        whileHover={{ scale: 1.02 }}
                    >
                        <p className="text-amber-300 flex items-center font-bold mb-2">
                            <FaTrophy className="mr-2" />
                            AI Comment:
                        </p>
                        <p className="text-white">{summary.feedback?.comment || "N/A"}</p>
                    </motion.div>

                    <motion.button 
                        onClick={() => router.push("/dashboard")} 
                        className="mt-6 px-6 py-2 bg-fuchsia-500 hover:bg-fuchsia-400 
                        transition-all duration-200 rounded-lg w-full text-white flex items-center 
                        justify-center shadow-lg"
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaRedoAlt className="mr-2" />
                        Restart Interview
                    </motion.button>
                </motion.div>
            ) : (
                <div className="flex flex-col items-center">
                    <p>Loading AI Feedback...</p>
                    <Loader size={24} />
                </div>
            )}
        </motion.div>
    )
}

export default withAuth(InterviewSummary)