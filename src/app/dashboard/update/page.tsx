"use client"
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ProfileFormData, updateSchema } from "@/utils/Schema";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";

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
    console.log("data", data);
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
        {errors.root && (
          <motion.p
            className="text-red-400 text-xs sm:text-sm mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {errors.root.message}
          </motion.p>
        )}
          <motion.div variants={childVariants}>
            <label htmlFor="username" className="block text-sm sm:text-base font-medium text-white mb-1">
              Username (optional)
            </label>
            <input
              id="username"
              type="text"
              {...register("username")}
              className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter new username"
            />
            {errors.username && (
              <motion.p
                className="text-red-400 text-xs sm:text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.username.message}
              </motion.p>
            )}
          </motion.div>
          <motion.div variants={childVariants}>
            <label htmlFor="email" className="block text-sm sm:text-base font-medium text-white mb-1">
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter new email"
            />
            {errors.email && (
              <motion.p
                className="text-red-400 text-xs sm:text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.email.message}
              </motion.p>
            )}
          </motion.div>
          <motion.div variants={childVariants}>
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-white mb-1">
              Password (optional)
            </label>
            <input
              id="password"
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter new password"
            />
            {errors.password && (
              <motion.p
                className="text-red-400 text-xs sm:text-sm mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {errors.password.message}
              </motion.p>
            )}
          </motion.div>
          <AnimatePresence>
            {password && (
              <motion.div variants={childVariants} initial="hidden" animate="visible" exit="hidden">
                <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-medium text-white mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="w-full px-4 py-2 sm:py-3 rounded-lg bg-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <motion.p
                    className="text-red-400 text-xs sm:text-sm mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
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
              {isSubmitting ? `Updating ${<Loader size={34} button={true} />}` : "Update Account"}
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
