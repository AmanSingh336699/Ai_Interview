"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaHistory, FaPlay, FaStar, FaChartLine, FaSpinner } from "react-icons/fa";
import { withAuth } from "@/components/withAuth";
import { useSession } from "next-auth/react";
import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import api from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";
import IPInfoModal from "@/components/IPInfoModal";

const words = ["Dashboard", "Your Interview Hub", "Prepare & Track"];

function Dashboard() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = useMemo(() => session?.user, [session]);

    const [wordIndex, setWordIndex] = useState(0);
    const [dashboardData, setDashboardData] = useState<{
        totalInterviews: number;
        provider: string;
        highestScoreInterview: { createdAt: string; role: string; _id: string; techStack: string; totalScore: number };
    } | null>(null);
    const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (user?.profileImage) {
            setProfileImage(user.profileImage);
        } else if (user?.image) {
            setProfileImage(user.image);
        } else {
            setProfileImage(null);
        }
    }, [user]);

    const fetchDashboardData = useCallback(async () => {
        try {
            const { data } = await api.get("/api/user-dashboard");
            setDashboardData(data);
            setStatus("success");
        } catch {
            setStatus("error");
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    useEffect(() => {
        const interval = setInterval(() => {
            setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const { data } = await api.post("/api/user-dashboard", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setProfileImage(data.profileImage);
            toast.success("Profile image updated successfully!");
        } catch (error) {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const AnimatedTitle = useMemo(
        () => (
            <AnimatePresence mode="wait">
                <motion.h1
                    key={wordIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-10"
                >
                    {words[wordIndex]}
                </motion.h1>
            </AnimatePresence>
        ),
        [wordIndex]
    );

    return (
        <motion.div
            className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4 sm:px-6 py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            <div className="flex justify-center w-full">{AnimatedTitle}</div>

            <div className="w-full max-w-5xl flex flex-col lg:grid lg:grid-cols-2 gap-6">
                {user && (
                    <motion.div
                        className="bg-white/10 p-5 rounded-lg shadow-xl backdrop-blur-md flex flex-col items-center space-y-4 border border-white/20"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div
                            title={profileImage ? "Change Profile Image" : "Add Profile"}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-md overflow-hidden cursor-pointer relative"
                        >
                            {isUploading ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-500 text-white">
                                    <FaSpinner className="animate-spin text-xl sm:text-2xl" />
                                </div>
                            ) : profileImage ? (
                                <Image src={profileImage} alt="Profile Image" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-sky-500 text-white text-xl sm:text-2xl font-bold">
                                    {user?.name ? user.name[0].toUpperCase() : "U"}
                                </div>
                            )}
                            <input
                                type="file"
                                id="profile-image-uploader"
                                disabled={isUploading}
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>

                        <div className="flex flex-col gap-3 items-center">
                            <p className="text-lg font-semibold">{user.name || "Guest User"}</p>
                            <p className="text-sm text-gray-200">{user.email || "No Email"}</p>
                            <IPInfoModal />
                            {dashboardData?.provider === "credentials" && (
                                <button
                                onClick={() => router.push("/dashboard/update")}
                                className="px-6 py-3 w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                                >
                                    Update Account
                                </button>
                            )}
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
                                <h2 className="text-xl sm:text-2xl font-semibold">
                                    Total Interviews: {dashboardData?.totalInterviews || 0}
                                </h2>
                            </div>

                            {dashboardData?.highestScoreInterview ? (
                                <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-md flex flex-col space-y-2 mt-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-md sm:text-lg font-semibold flex items-center">
                                            <FaStar className="text-yellow-400 mr-2" /> Best Interview
                                        </h3>
                                        <span className="text-xs bg-gray-700 px-2 sm:px-3 py-1 rounded-full text-gray-300">
                                            {new Date(dashboardData.highestScoreInterview.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm sm:text-base">
                                        <strong>Role:</strong> {dashboardData.highestScoreInterview.role}
                                    </p>
                                    <p className="text-sm sm:text-base">
                                        <strong>Tech Stack:</strong> {dashboardData.highestScoreInterview.techStack}
                                    </p>
                                    <p className="text-sm sm:text-base">
                                        <strong>Score:</strong> {dashboardData.highestScoreInterview.totalScore}
                                    </p>
                                    <Link href={`/summery/${dashboardData.highestScoreInterview?._id}`} className="rounded-md">
                                        <motion.div
                                            whileTap={{ scale: 0.95 }}
                                            whileHover={{ scale: 1.05 }}
                                            className="mt-4 px-4 sm:px-6 py-2 sm:py-3 rounded-md bg-sky-500 transition-all cursor-pointer hover:bg-sky-700 text-center text-sm sm:text-base"
                                        >
                                            View Summary
                                        </motion.div>
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
                className="w-full max-w-5xl bg-white/10 p-4 sm:p-6 mt-6 rounded-lg shadow-2xl backdrop-blur-md flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6 border border-white/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Link href={`/interview/setup`}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center justify-center bg-emerald-500 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-md sm:text-lg hover:bg-emerald-600 transition-all hover:shadow-xl w-full lg:w-auto"
                    >
                        <FaPlay className="mr-2 sm:mr-3" />
                        <h2 className="text-xl sm:text-2xl font-semibold">Create New Interview</h2>
                    </motion.div>
                </Link>

                <motion.button
                    onClick={() => router.push("/dashboard/history")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center bg-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-all hover:shadow-lg w-full lg:w-1/2 text-md sm:text-lg"
                >
                    <FaHistory className="mr-2 sm:mr-3" />
                    View Past Interviews
                </motion.button>

                <motion.button
                    onClick={() => router.push("/battleHome")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center bg-gray-800 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-all hover:shadow-lg w-full lg:w-1/2 text-md sm:text-lg"
                >
                    ⚔️ Battle with friends
                </motion.button>
            </motion.div>
        </motion.div>
    );
}

export default withAuth(Dashboard);