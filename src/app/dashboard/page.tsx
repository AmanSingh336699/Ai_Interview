"use client"

import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FaHistory, FaPlay, FaStar, FaChartLine } from "react-icons/fa"
import { withAuth } from "@/components/withAuth"
import { useSession } from "next-auth/react"
import { useState, useEffect, useMemo, useCallback } from "react"
import api from "@/lib/api"
import Link from "next/link"

const words = ["Dashboard", "Your Interview Hub", "Prepare & Track"]

function Dashboard() {
    const router = useRouter()
    const { data: session } = useSession()
    const user = useMemo(() => session?.user, [session])

    const [wordIndex, setWordIndex] = useState(0)
    const [dashboardData, setDashboardData] = useState<{ totalInterviews: number; highestScoreInterview: { createdAt: string; role: string; _id: string; techStack: string; totalScore: number } } | null>(null)
    const [status, setStatus] = useState<"loading" | "error" | "success">("loading")

    const fetchDashboardData = useCallback(async () => {
        try {
            const { data } = await api.get("/api/user-dashboard")
            setDashboardData(data)
            setStatus("success")
        } catch { 
            setStatus("error")
        }
    }, [])

    useEffect(() => {
        fetchDashboardData()
    }, [fetchDashboardData])

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prevIndex) => (prevIndex + 1) % words.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const AnimatedTitle = useMemo(
        () => (
            <AnimatePresence mode="wait">
                <motion.h1
                    key={wordIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl sm:text-5xl font-bold mb-6 text-center"
                >
                    {words[wordIndex]}
                </motion.h1>
            </AnimatePresence>
        ),
        [wordIndex]
    )

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {AnimatedTitle}

            <div className="w-full max-w-5xl lg:grid lg:grid-cols-2 gap-6">
                {user && (
                    <motion.div
                        className="bg-white/10 p-5 rounded-lg shadow-xl backdrop-blur-md flex flex-col items-center space-y-4 border border-white/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-14 h-14 flex items-center justify-center bg-blue-500 text-white text-2xl font-bold rounded-full shadow-md">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                        </div>

                        <div className="flex flex-col">
                            <p className="text-lg font-semibold">{user.name || "Guest User"}</p>
                            <p className="text-sm text-gray-200">{user.email || "No Email"}</p>
                        </div>
                    </motion.div>
                )}

                <motion.div
                    className="bg-white/10 p-6 rounded-lg shadow-2xl backdrop-blur-md border border-white/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {status === "loading" ? (
                        <motion.div
                            className="w-full bg-gray-500 h-2 rounded-full overflow-hidden"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <div className="h-full bg-sky-500 animate-pulse"></div>
                        </motion.div>
                    ) : status === "error" ? (
                        <p className="text-center text-red-500">Failed to fetch dashboard data</p>
                    ) : (
                        <>
                            <div className="flex items-center bg-gray-900 p-4 rounded-lg transition-all hover:shadow-xl shadow-md">
                                <FaChartLine className="text-blue-400 text-3xl mr-4" />
                                <h2 className="text-2xl font-semibold">
                                    Total Interviews: {dashboardData?.totalInterviews || 0}
                                </h2>
                            </div>

                            {dashboardData?.highestScoreInterview ? (
                                <div className="bg-gray-900 p-6 rounded-lg shadow-md flex flex-col space-y-2 mt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold flex items-center">
                                            <FaStar className="text-yellow-400 mr-2" /> Best Interview
                                        </h3>
                                        <span className="text-xs bg-gray-700 px-3 py-1 rounded-full text-gray-300">
                                            {new Date(dashboardData.highestScoreInterview.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p><strong>Role:</strong> {dashboardData.highestScoreInterview.role}</p>
                                    <p><strong>Tech Stack:</strong> {dashboardData.highestScoreInterview.techStack}</p>
                                    <p><strong>Score:</strong> {dashboardData.highestScoreInterview.totalScore}</p>
                                    <Link href={`/summery/${dashboardData.highestScoreInterview?._id}`} className="rounded-md">
                                        <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale:1.05 }} className="mt-4 px-6 py-3 rounded-md bg-sky-500 transition-all cursor-pointer hover:bg-sky-700 text-center">View Summary</motion.div>
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-center text-gray-400">No interviews found</p>
                            )}
                        </>
                    )}
                </motion.div>
            </div>

            <motion.div
                className="w-full max-w-5xl bg-white/10 p-6 mt-6 rounded-lg shadow-2xl backdrop-blur-md flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link href={`/interview/setup`}>
                    <motion.div whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }} 
                        className="flex items-center bg-emerald-500 px-6 py-3 rounded-lg text-lg hover:bg-emerald-600 transition-all hover:shadow-xl"
                        >
                        <FaPlay className="mr-3" />
                        <h2 className="text-2xl font-semibold">Create New Interview</h2>
                    </motion.div>
                </Link>

                <motion.button
                    onClick={() => router.push("/dashboard/history")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center bg-gray-800 px-6 py-3 rounded-lg hover:bg-gray-700 transition-all hover:shadow-lg w-full lg:w-1/2"
                >
                    <FaHistory className="mr-3" />
                    View Past Interviews
                </motion.button>
            </motion.div>
        </motion.div>
    )
}

export default withAuth(Dashboard)