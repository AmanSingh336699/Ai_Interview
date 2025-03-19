"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import InputField from "@/components/InputField";
import { motion } from "framer-motion";
import { FaPlay, FaUserTie, FaCalendar, FaCode, FaArrowLeft } from "react-icons/fa";
import { withAuth } from "@/components/withAuth";
import Loader from "@/components/ui/Loader";
import Funny from "@/components/ui/Funny";
import Link from "next/link";

const schema = z.object({
  role: z.string().min(3, "Role is required"),
  experience: z.string().min(1, "Experience is required"),
  techStack: z.string().min(3, "Tech Stack is required"),
  aiComments: z.boolean().default(false),
});

function StartInterview() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { aiComments: false },
  });

  const aiComments = watch("aiComments");

  const handleToggle = () => {
    if (!aiComments) {
      setShowModal(true);
    }
    setValue("aiComments", !aiComments);
  };

  const startInterview = useCallback(
    async (data: any) => {
      try {
        const res = await api.post("/api/interview/start", {
          userId: session?.user?.id,
          ...data,
        });
        if (res.data?.interviewId) {
          router.push(`/interview/${res.data.interviewId}`);
          toast.success("Interview started successfully");
        }
      } catch (_error) {
        toast.error("Error starting interview");
        console.error(_error);
      }
    },
    [router, session?.user?.id]
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gray-900 shadow-lg rounded-xl p-4 sm:p-8 w-full max-w-lg"
      >
        <div className="mb-4">
          <Link href="/dashboard" className="text-gray-300 hover:text-white flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-extrabold text-center mb-4 bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">
          Start New Interview
        </h1>
        <p className="text-gray-300 text-center mb-6">
          Fill in the details to begin your mock interview.
        </p>

        <form onSubmit={handleSubmit(startInterview)} className="space-y-6">
          <InputField
            placeholder="e.g., Frontend Developer"
            label="Role"
            name="role"
            register={register}
            error={errors.role}
            icon={<FaUserTie className="text-gray-400" />}
          />
          <InputField
            placeholder="e.g., 3+ years"
            label="Experience"
            name="experience"
            register={register}
            error={errors.experience}
            icon={<FaCalendar className="text-gray-400" />}
          />
          <InputField
            placeholder="e.g., React, Node.js, MongoDB"
            label="Tech Stack"
            name="techStack"
            register={register}
            error={errors.techStack}
            icon={<FaCode className="text-gray-400" />}
          />

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Enable AI Comments</span>
            <motion.div
              className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                aiComments ? "bg-emerald-500" : "bg-gray-500"
              }`}
              onClick={handleToggle}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                className="w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: aiComments ? 24 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            </motion.div>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            {aiComments
              ? "AI comments are enabled. You'll receive feedback after each answer."
              : "AI comments are disabled."}
          </p>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center bg-sky-500 px-6 py-3 rounded-lg text-white text-lg hover:bg-sky-600 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-sky-500/50 hover:shadow-xl hover:shadow-sky-500/70"
          >
            {isSubmitting ? (
              <Loader size={24} button={true} />
            ) : (
              <>
                <FaPlay className="mr-2" /> Start Interview
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      <Funny
        onClose={() => setShowModal(false)}
        message="Brace yourself! AI comments are now ON. Every answer you submit will be analyzed, judged, and probably criticized... but in a friendly way! 😏"
        show={showModal}
      />
    </div>
  );
}

export default withAuth(StartInterview);