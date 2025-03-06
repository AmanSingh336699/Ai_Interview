"use client"

import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { FaHistory, FaPlay } from "react-icons/fa"
import { withAuth } from "@/components/withAuth"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

const words = ["Dashboard", "Your Interview Hub", "Prepare & Track"]

function Dashboard() {
    const router = useRouter()
    const { data: session } = useSession()
    const user = session?.user
    const [wordIndex, setWordIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prevIndex) => (prevIndex + 1) % words.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-600 text-white px-6 py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
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

            {user && (
                <motion.div
                    className="w-full max-w-md bg-white/10 p-5 rounded-lg shadow-xl backdrop-blur-md flex items-center space-x-4 border border-white/20"
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
                className="w-full max-w-md bg-white/10 p-6 mt-6 rounded-lg shadow-2xl backdrop-blur-md flex flex-col space-y-6 border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.button
                    onClick={() => router.push("/interview/setup")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center bg-emerald-500 px-6 py-3 rounded-lg text-lg shadow-lg hover:bg-emerald-600 transition-all hover:shadow-xl"
                >
                    <FaPlay className="mr-3" />
                    Start New Interview
                </motion.button>

                <motion.button
                    onClick={() => router.push("/dashboard/history")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center bg-gray-800 px-6 py-3 rounded-lg hover:bg-gray-700 transition-all hover:shadow-lg"
                >
                    <FaHistory className="mr-3" />
                    View Past Interviews
                </motion.button>
            </motion.div>
        </motion.div>
    )
}

export default withAuth(Dashboard)