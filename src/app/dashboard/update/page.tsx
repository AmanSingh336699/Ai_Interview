"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ProfileFormData, updateSchema } from "@/utils/Schema";
import { useRouter } from "next/navigation";
import { FaLock, FaUser, FaEnvelope } from "react-icons/fa";
import InputField from "@/components/InputField";

export default function ProfileForm() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const router = useRouter();
  const password = watch("password");

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const payload = {
        ...(data.username && { username: data.username }),
        ...(data.email && { email: data.email }),
        ...(data.password && { password: data.password }),
        ...(data.confirmPassword && { confirmPassword: data.confirmPassword }),
      };
      await api.patch("/api/user-dashboard", payload);
      toast.success("Profile updated successfully!");
      reset();
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/api/user-dashboard");
      toast.success("Account deleted!");
      router.push("/login");
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsDialogOpen(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4 sm:p-6 md:p-8">
      <motion.div
        className="bg-white/10 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full border border-white/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-white mb-6 sm:mb-8 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          variants={childVariants}
        >
          Update Your Profile
        </motion.h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <InputField
            label="Username (optional)"
            name="username"
            register={register}
            error={errors.username}
            placeholder="Enter new username"
            icon={<FaUser className="text-gray-400" />}
          />
          <InputField
            label="Email (optional)"
            name="email"
            register={register}
            error={errors.email}
            type="email"
            placeholder="Enter new email"
            icon={<FaEnvelope className="text-gray-400" />}
          />
          <InputField
            label="Password (optional)"
            name="password"
            register={register}
            error={errors.password}
            type="password"
            placeholder="Enter new password"
            icon={<FaLock className="text-gray-400" />}
          />
          <AnimatePresence>
            {password && (
              <motion.div
                variants={childVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <InputField
                  label="Confirm Password"
                  name="confirmPassword"
                  register={register}
                  error={errors.confirmPassword}
                  type="password"
                  placeholder="Confirm password"
                  icon={<FaLock className="text-gray-400" />}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6" variants={childVariants}>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSubmitting ? `Updating....` : "Update Account"}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-lg shadow-lg hover:scale-105 transition disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Delete Account
            </motion.button>
          </motion.div>
        </form>
      </motion.div>

      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-lg z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDialogOpen(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-white/20"
              initial={{ scale: 0.8, opacity: 0, y: -50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">
                Are you sure?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base text-center mb-6">
                This action is irreversible. Your account and all data will be deleted permanently.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <motion.button
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleDeleteAccount}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 sm:px-6 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? "Deleting..." : "Delete"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
