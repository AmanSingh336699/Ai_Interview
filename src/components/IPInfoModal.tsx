"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Spinner = ({ className = "" }) => (
    <div className={`animate-spin rounded-full border-t-2 border-b-2 border-blue-400 ${className}`} />
);

export default function IPInfoModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [ipInfo, setIpInfo] = useState<{
        ip: string;
        isp: string;
        city: string;
        region: string;
        country: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchIPInfo = async () => {
        if (!ipInfo) {
            setLoading(true);
            try {
                const { data } = await axios.get(process.env.NEXT_PUBLIC_IP_API_URL!);
                setIpInfo({
                    ip: data.ip,
                    isp: data.isp,
                    city: data.city,
                    region: data.state_prov,
                    country: data.country_name,
                });
            } catch (error) {
                console.error("Failed to fetch IP info:", error);
                setIpInfo(null);
            } finally {
                setLoading(false);
            }
        }
        setIsOpen(true);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const childVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <div className="text-center">
            <div className="flex justify-center items-center space-x-2">
                <button
                    onClick={fetchIPInfo}
                    disabled={loading}
                    className="px-6 py-3 w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                >
                    {loading ? <Spinner className="h-5 w-5" /> : "🌍 Show My IP & Location"}
                </button>
                <motion.div
                    className="w-3 h-3 rounded-full"
                    animate={{
                        backgroundColor: loading ? "#60A5FA" : ipInfo ? "#34D399" : "#9CA3AF",
                        scale: loading ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900/80 to-black/80 backdrop-blur-lg z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            className="relative bg-gradient-to-br from-blue-600/30 to-purple-600/30 backdrop-blur-2xl p-4 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/30"
                            initial={{ y: -100, opacity: 0, scale: 0.8 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -100, opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-white text-xl hover:scale-110 hover:rotate-90 transition-all"
                            >
                                ❌
                            </button>
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
                                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Your IP & Location
                                </span> 🌍
                            </h2>
                            {loading ? (
                                <div className="flex flex-col items-center py-4">
                                    <Spinner className="h-8 w-8" />
                                    <p className="text-gray-300 mt-2">Fetching details...</p>
                                </div>
                            ) : ipInfo ? (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="space-y-3 text-left"
                                >
                                    <motion.div variants={childVariants} className="flex">
                                        <span className="w-24 text-white font-semibold">IP Address:</span>
                                        <span className="text-blue-300 font-medium">{ipInfo.ip}</span>
                                    </motion.div>
                                    <motion.div variants={childVariants} className="flex">
                                        <span className="w-24 text-white font-semibold">ISP:</span>
                                        <span className="text-blue-300 font-medium">{ipInfo.isp}</span>
                                    </motion.div>
                                    <motion.div variants={childVariants} className="flex">
                                        <span className="w-24 text-white font-semibold">Location:</span>
                                        <span className="text-blue-300 font-medium">
                                            {ipInfo.city}, {ipInfo.region}, {ipInfo.country}
                                        </span>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <p className="text-gray-300">No data found.</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}