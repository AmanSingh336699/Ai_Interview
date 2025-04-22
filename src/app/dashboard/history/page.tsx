"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaArrowLeft, FaArrowRight, FaRocket, FaClock, FaQuestion, FaTrophy, FaMedal } from "react-icons/fa";
import { motion } from "framer-motion";
import  useDebounce from "@/hooks/useDebounce"
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { withAuth } from "@/components/withAuth";
import Skeleton from "@/components/ui/Skeleton";

interface Interview {
    _id: string;
    createdAt: string;
    role: string;
    questions: string[];
    currentIndex: number;
    status: string;
    score: number;
    response: { score: number }[];
}

function InterviewHistory() {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [order, setOrder] = useState("desc");
    const [statusFilter, setStatusFilter] = useState("");
    const { data: session } = useSession();
    const router = useRouter();

    const debouncedOrder = useDebounce(order, 300);
    const debouncedStatus = useDebounce(statusFilter, 300);

    const fetchInterviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/interview/history`, {
                params: {
                    userId: session?.user?.id,
                    page,
                    order: debouncedOrder,
                    status: debouncedStatus,
                },
            });

            setInterviews(res.data.interviews);
            setTotalPages(res.data.totalPages);
        } catch {
            setInterviews([]);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id, page, debouncedOrder, debouncedStatus]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews, order, statusFilter, page]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [totalPages]);

    const deleteInterview = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this interview?")) return;
        try {
            await api.delete(`/api/interview/delete`, { params: { interviewId: id } });
            setInterviews((prev) => prev.filter((i) => i._id !== id));
        } catch {
            alert("Failed to delete interview.");
        }
    }, []);

    return (
        <motion.div
            className="relative min-h-screen w-full flex flex-col items-center text-white px-4 py-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-r from-teal-600 via-blue-700 to-purple-800"></div>
            <div className="absolute inset-0 -z-10 w-full h-full bg-black/30"></div>

            <motion.h2
                className="text-3xl sm:text-4xl font-bold text-center mb-6 drop-shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                📋 Interview History
            </motion.h2>

            <motion.div
                className="flex flex-wrap justify-center gap-4 mb-6 w-full max-w-2xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <select
                    className="p-2 bg-white text-black rounded-lg shadow-md"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                >
                    <option value="desc">Newest</option>
                    <option value="asc">Oldest</option>
                </select>
                <select
                    className="p-2 bg-white text-black rounded-lg shadow-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                </select>
            </motion.div>

            {loading ? (
                <div className="grid gap-6 w-full max-w-7xl mx-auto">
                    {Array(4)
                        .fill(0)
                        .map((_, index) => (
                            <Skeleton key={index} height="80px" width="100%" />
                        ))}
                </div>
            ) : interviews.length === 0 ? (
                <motion.div
                    className="flex flex-col items-center justify-center text-center space-y-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
                >
                    <motion.h2 className="text-4xl font-extrabold drop-shadow-lg">
                        No Interviews Yet! 🚀
                    </motion.h2>
                    <motion.p className="text-lg text-gray-300 max-w-lg drop-shadow-md">
                        Start your first interview now and track your progress. Get real-time AI feedback and improve your skills!
                    </motion.p>
                    <motion.button
                        onClick={() => router.push("/interview/setup")}
                        className="bg-teal-500 text-white px-6 py-3 rounded-lg text-lg shadow-lg hover:bg-teal-600 transition-all hover:shadow-xl"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <FaRocket className="inline mr-2" /> Start New Interview
                    </motion.button>
                </motion.div>
            ) : (
                <>
                    <motion.ul
                        className="grid gap-4 w-full max-w-7xl mx-auto grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 },
                            },
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        {interviews.map((interview) => (
                            <motion.li
                                key={interview._id}
                                className="p-5 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl transition-transform hover:scale-105 hover:shadow-2xl"
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 },
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="font-semibold text-lg drop-shadow-md flex items-center gap-2">
                                    <FaClock className="text-gray-400" /> {new Date(interview.createdAt).toLocaleDateString()}
                                </p>
                                <p className="drop-shadow-md flex items-center gap-2">
                                    <FaMedal className="text-amber-300" /> Role: {interview.role}
                                </p>
                                <p className="drop-shadow-md flex items-center gap-2">
                                    <FaQuestion className="text-fuchsia-400" /> {interview.status === "completed" ? `Questions: ${interview.questions.length}` : `Current Question: ${interview.currentIndex + 1}`}
                                </p>
                                <p className="drop-shadow-md flex items-center gap-2">
                                    <FaTrophy className="text-yellow-400" /> Score: {interview.response.reduce((acc, r) => acc + r.score, 0)}
                                </p>
                                <p className="drop-shadow-md flex items-center gap-2">
                                    Status:{" "}
                                    {interview.status === "completed" ? (
                                        "✅ Completed"
                                    ) : (
                                        <button
                                            className="text-yellow-300 underline hover:text-yellow-500"
                                            onClick={() => router.push(`/interview/${interview._id}`)}
                                        >
                                            ⏳ Ongoing
                                        </button>
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    {interview.status === "completed" && (
                                        <motion.button
                                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                            onClick={() => router.push(`/summery/${interview._id}`)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            📜 View Summary
                                        </motion.button>
                                    )}
                                    <motion.button
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                        onClick={() => deleteInterview(interview._id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FaTrash className="mr-1" /> Delete
                                    </motion.button>
                                </div>
                            </motion.li>
                        ))}
                    </motion.ul>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-between items-center w-full max-w-sm">
                            <motion.button
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page === 1}
                                className="bg-gray-500 px-4 py-2 rounded-lg disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaArrowLeft /> Previous
                            </motion.button>
                            <span className="text-lg">Page {page} of {totalPages}</span>
                            <motion.button
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page >= totalPages}
                                className="bg-gray-500 px-4 py-2 rounded-lg disabled:opacity-50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Next <FaArrowRight />
                            </motion.button>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}

export default withAuth(InterviewHistory);