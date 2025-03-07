"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { withAuth } from "@/components/withAuth";
import Skeleton from "@/components/ui/Skeleton";

interface Interview {
    _id: string;
    createdAt: string;
    role: string;
    questions: string[];
    status: string;
    score: number;
    response: { score: number }[];
}

function InterviewHistory() {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState("createdAt");
    const [order, setOrder] = useState("desc");
    const [statusFilter, setStatusFilter] = useState("");
    const { data: session } = useSession();
    const router = useRouter();

    const debouncedSortBy = useDebounce(sortBy, 300);
    const debouncedOrder = useDebounce(order, 300);
    const debouncedStatus = useDebounce(statusFilter, 300);

    const fetchInterviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/api/interview/history`, {
                params: {
                    userId: session?.user?.id,
                    page,
                    sortBy: debouncedSortBy,
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
    }, [session?.user?.id, page, debouncedSortBy, debouncedOrder, debouncedStatus]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews, sortBy, order, statusFilter, page]);

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
            <div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-700"></div>

            <motion.h2
                className="text-3xl sm:text-4xl font-bold text-center mb-6"
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
                <select className="p-2 bg-white text-black rounded-lg" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="createdAt">Newest</option>
                    <option value="score">Highest Score</option>
                </select>
                <select className="p-2 bg-white text-black rounded-lg" value={order} onChange={(e) => setOrder(e.target.value)}>
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>
                <select className="p-2 bg-white text-black rounded-lg" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                </select>
            </motion.div>

            {loading ? (
                <div className="grid gap-6 w-full">
                    {Array(5).fill(0).map((_, index) => (
                        <Skeleton key={index} height="80px" width="100%" />
                    ))}
                </div>
            ) : interviews.length === 0 ? (
                <motion.div
                    className="flex flex-col items-center justify-center text-center space-y-6"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    <motion.h2 className="text-4xl font-extrabold text-gray-300">
                        No Interviews Yet! 🚀
                    </motion.h2>
                    <motion.p className="text-lg text-gray-400 max-w-lg">
                        Start your first interview now and track your progress.
                        Get real-time AI feedback and improve your skills!
                    </motion.p>
                    <motion.button 
                        onClick={() => router.push("/interview/setup")}
                        className="bg-emerald-500 text-white px-6 py-3 rounded-lg text-lg shadow-lg hover:bg-emerald-600 transition-all hover:shadow-xl"
                    >
                        🚀 Start New Interview
                    </motion.button>
                </motion.div>
            ) : (
                <>
                    <ul className="grid gap-4 w-full max-w-2xl">
                        {interviews.map((interview) => (
                            <motion.li
                                key={interview._id}
                                className="p-5 bg-white/20 backdrop-blur-md shadow-lg rounded-xl transition-transform hover:scale-105 hover:shadow-xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <p className="font-semibold text-lg">📅 {new Date(interview.createdAt).toLocaleDateString()}</p>
                                <p>Role: {interview.role}</p>
                                <p>❓ Questions: {interview.questions.length}</p>
                                <p>🏆 Score: {interview.response.reduce((acc, r) => acc + r.score, 0)}</p>
                                <p>Status: {interview.status === "completed" ? "✅ Completed" : "⏳ Ongoing"}</p>
                                <div className="flex flex-wrap gap-3 mt-4">
                                    <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition" onClick={() => router.push(`/summery/${interview._id}`)}>
                                        📜 View Summary
                                    </button>
                                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition" onClick={() => deleteInterview(interview._id)}>
                                        <FaTrash className="mr-1" /> Delete
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </ul>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-between items-center w-full max-w-sm">
                            <button onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1} className="bg-gray-500 px-4 py-2 rounded-lg disabled:opacity-50">
                                <FaArrowLeft /> Previous
                            </button>
                            <span>Page {page} of {totalPages}</span>
                            <button onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages} className="bg-gray-500 px-4 py-2 rounded-lg disabled:opacity-50">
                                Next <FaArrowRight />
                            </button>
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
}

export default withAuth(InterviewHistory);