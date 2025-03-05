"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useDebounce } from "@/hooks/useDebounce";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { withAuth } from "@/components/withAuth";
import Select from "react-select";
import Skeleton from "@/components/ui/Skeleton";

interface Interview {
    _id: string;
    createdAt: string;
    questions: string[];
    completed: boolean;
    score: number;
}

interface SelecOption {
    value: string;
    label: string;
}

function InterviewHistory() {
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState<SelecOption | null>({ value: "startedAt", label: "Newest" });
    const [order, setOrder] = useState<SelecOption | null>({ value: "desc", label: "Descending" });
    const [statusFilter, setStatusFilter] = useState<SelecOption | null>(null);
    const { data: session } = useSession();
    const router = useRouter();

    const debouncedSortBy = useDebounce(sortBy?.value || "", 300);
    const debouncedOrder = useDebounce(order?.value || "", 300);
    const debouncedStatus = useDebounce(statusFilter?.value || "", 300);

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
    }, [fetchInterviews, sortBy, order, statusFilter]);

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
            className="p-6 max-w-4xl mx-auto text-white flex flex-col items-center justify-center min-h-screen"
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {loading ? (
                <ul className="grid gap-6">
                    {Array(5).fill(0).map((_, index) => (
                        <motion.li 
                            key={index} 
                            className="p-5 bg-gray-800 shadow-lg rounded-xl flex flex-col md:flex-row justify-between items-center"
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <div className="space-y-2 w-full">
                                <Skeleton height="24px" width="50%" />
                                <Skeleton height="16px" width="80%" />
                                <Skeleton height="16px" width="60%" />
                                <Skeleton height="16px" width="40%" />
                                <Skeleton height="16px" width="30%" />
                            </div>
                        </motion.li>
                    ))}
                </ul>
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
                    <h2 className="text-3xl font-bold text-center mb-6">📋 Interview History</h2>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                        <Select options={[{ value: "startedAt", label: "Newest" }, { value: "score", label: "Highest Score" }]} 
                            value={sortBy} onChange={(newValue) => setSortBy(newValue as { value: string; label: string })} className="w-full md:w-auto text-black" />
                        <Select options={[{ value: "desc", label: "Descending" }, { value: "asc", label: "Ascending" }]} 
                            value={order} onChange={(newValue) => setOrder(newValue as { value: string; label: string })} className="w-full md:w-auto text-black" />
                        <Select options={[{ value: "", label: "All" }, { value: "completed", label: "Completed" }]} 
                            value={statusFilter} onChange={(newValue) => setStatusFilter(newValue as { value: string; label: string } | null)} className="w-full md:w-auto text-black" />
                    </div>

                    <ul className="grid gap-6">
                        {interviews.map((interview) => (
                            <motion.li 
                                key={interview._id}
                                className="p-5 bg-gray-800 shadow-lg rounded-xl flex flex-col md:flex-row justify-between items-center transition hover:shadow-2xl"
                                initial={{ opacity: 0, y: 20 }} 
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="text-gray-300 space-y-2">
                                    <p className="font-semibold text-lg">📅 Date: {new Date(interview.createdAt).toLocaleDateString()}</p>
                                    <p>❓ Questions: {interview.questions.length}</p>
                                    <p>🏆 Score: {interview.score}</p>
                                    <p>Status: {interview.completed ? "✅ Completed" : "⏳ Ongoing"}</p>
                                </div>
                                <div className="flex space-x-3 mt-4 md:mt-0">
                                    <button 
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                        onClick={() => router.push(`/summary/${interview._id}`)}
                                    >
                                        📜 View Summary
                                    </button>
                                    <button 
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                                        onClick={() => deleteInterview(interview._id)}
                                    >
                                        <FaTrash className="mr-1" /> Delete
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                    </ul>

                    <div className="mt-8 flex justify-between items-center">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page === 1}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
                        >
                            <FaArrowLeft className="mr-1" /> Previous
                        </button>
                        <span className="text-lg font-semibold">Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage((prev) => (page < totalPages ? prev + 1 : prev))}
                            disabled={page >= totalPages}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 hover:bg-gray-400 transition"
                        >
                            Next <FaArrowRight className="ml-1" />
                        </button>
                    </div>
                </>
            )}
        </motion.div>
    );
}

export default withAuth(InterviewHistory);