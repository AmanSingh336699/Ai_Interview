"use client"

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaTrash, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion"; 
import { useDebounce } from "@/hooks/useDebounce";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { withAuth } from "@/components/withAuth";

interface Interview {
    _id: string;
    startedAt: string;
    questions: string[];
    completed: boolean;
    duration?: number;
    score?: number;
}

function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState("startedAt");
    const [order, setOrder] = useState("desc");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateRange, setDateRange] = useState("");
    const { data: session } = useSession()

    const router = useRouter();

    // Debounce filter changes for efficiency
    const debouncedSortBy = useDebounce(sortBy, 300);
    const debouncedOrder = useDebounce(order, 300);
    const debouncedStatus = useDebounce(statusFilter, 300);
    const debouncedDate = useDebounce(dateRange, 300);

    // 🔹 Fetch Interviews with Pagination, Sorting & Filtering
    const fetchInterviews = useCallback(async () => {
        try {
            const res = await api.get(`/api/interview/history`, {
                params: {
                    userId: session?.user?.id,
                    page,
                    limit,
                    sortBy: debouncedSortBy,
                    order: debouncedOrder,
                    status: debouncedStatus,
                    dateRange: debouncedDate,
                },
            });

            setInterviews(res.data.interviews);
            setTotalPages(res.data.totalPages);
        } catch {
            setInterviews([]);
        }
    }, [session?.user?.id, page, debouncedSortBy, debouncedOrder, debouncedStatus, debouncedDate]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);


    const deleteInterview = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this interview?")) return;
        try {
            await api.delete(`/api/interview/delete`, { params: { interviewId: id } });
            setInterviews((prev) => prev.filter((i: Interview) => i._id !== id));
        } catch {
            alert("Failed to delete interview.");
        }
    }, []);

    const hasNextPage = useMemo(() => page < totalPages, [page, totalPages]);

    return (
        <motion.div 
            className="p-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl font-bold text-gray-300 mb-6 text-center">📋 Interview History</h2>

            <div className="mb-6 flex text-gray-800 flex-col md:flex-row md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                <select 
                    value={sortBy} 
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)} 
                    className="border p-3 rounded-lg w-full md:w-auto shadow-sm bg-white"
                >
                    <option value="startedAt">Newest</option>
                    <option value="score">Highest Score</option>
                </select>

                <select 
                    value={order} 
                    onChange={(e) => setOrder(e.target.value)} 
                    className="border p-3 rounded-lg w-full md:w-auto shadow-sm bg-white"
                >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                </select>

                <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)} 
                    className="border p-3 rounded-lg w-full md:w-auto shadow-sm bg-white"
                >
                    <option value="">All</option>
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                </select>

                <input 
                    type="date" 
                    onChange={(e) => setDateRange(e.target.value)} 
                    className="border p-3 rounded-lg w-full md:w-auto shadow-sm bg-white"
                />
            </div>

            {interviews.length === 0 ? (
                <p className="text-center text-gray-500">No previous interviews found.</p>
            ) : (
                <ul className="grid gap-6">
                    {interviews.map((interview, index) => (
                        <motion.li 
                            key={interview._id}
                            className="p-5 bg-white shadow-lg rounded-xl flex flex-col md:flex-row justify-between items-center transition hover:shadow-2xl"
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className="text-gray-700 space-y-2">
                                <p className="font-semibold text-lg">📅 Date: {new Date(interview.createdAt).toLocaleDateString()}</p>
                                <p>❓ Questions: {interview.questions.length}</p>
                                <p>Status: {interview.status}</p>
                            </div>

                            <div className="flex space-x-3 mt-4 md:mt-0">
                                <button 
                                    className="bg-sky-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-sky-600 transition"
                                    onClick={() => router.push(`/summery/${interview._id}`)}
                                >
                                    📜 View Summary
                                </button>
                                <button 
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600 transition"
                                    onClick={() => deleteInterview(interview._id)}
                                >
                                    <FaTrash className="mr-1" /> Delete
                                </button>
                            </div>
                        </motion.li>
                    ))}
                </ul>
            )}

            <div className="mt-8 flex justify-between items-center">
                <button
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 hover:bg-gray-400 transition"
                >
                    <FaArrowLeft className="mr-1" /> Previous
                </button>
                <span className="text-lg font-semibold">Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage((prev) => (hasNextPage ? prev + 1 : prev))}
                    disabled={!hasNextPage}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50 hover:bg-gray-400 transition"
                >
                    Next <FaArrowRight className="ml-1" />
                </button>
            </div>
        </motion.div>
    );
}
export default withAuth(InterviewHistory)