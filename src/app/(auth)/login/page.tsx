"use client"

import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"
import React, { useCallback, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, LoginValues } from "@/lib/validationSchema"
import { AiFillGithub } from "react-icons/ai"
import Loader from "@/components/ui/Loader"

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        const res = await signIn("credentials", { ...data, redirect: false })
        if (res.error) {
          console.log("error:", res)
          return toast.error("Invalid credentials")
        }
        toast.success("Login successfully!")
        setTimeout(() => router.push("/dashboard"), 1500)
      } catch (_error) {
        console.log(_error)
        toast.error("Login failed")
      }
    },
    [router]
  )

  const toggleEye = useCallback(() => setShowPassword((prev) => !prev), [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-6"
    >
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 1, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          initial={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-semibold text-center mb-6 text-gray-700">Login</h1>
          <div className="relative mt-4">
            <motion.input
              {...register("email")}
              placeholder="Email"
              whileFocus={{ scale: 1.05 }}
              autoFocus
              className={`border ${errors.email ? "border-rose-500" : "border-gray-300"} p-3 text-gray-800 rounded-lg w-full focus:outline-none`}
            />
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-500 text-sm"
              >
                {errors.email.message}
              </motion.p>
            )}
          </div>
          <div className="relative mt-4">
            <motion.input
              {...register("password")}
              whileFocus={{ scale: 1.05 }}
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={`border ${errors.password ? "border-rose-500" : "border-gray-300"} p-3 text-gray-800 rounded-lg w-full focus:outline-none`}
            />
            <span
              className="absolute top-3 right-3 cursor-pointer"
              onClick={toggleEye}
            >
              {showPassword ? (
                <AiFillEyeInvisible size={22} className="text-sky-400" />
              ) : (
                <AiFillEye size={22} className="text-sky-400" />
              )}
            </span>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose-500 text-sm"
              >
                {errors.password.message}
              </motion.p>
            )}
          </div>
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-emerald-500 text-white p-2 rounded-lg transition-all disabled:bg-gray-400 font-medium hover:bg-green-700"
          >
            {isSubmitting ? <Loader size={24} button={true} /> : "Login"}
          </motion.button>
        </motion.form>

        <div className="flex items-center justify-center my-4">
          <div className="w-full border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">OR</span>
          <div className="w-full border-t border-gray-300"></div>
        </div>

        <motion.button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="mt-4 bg-gray-800 text-white p-2 rounded-lg flex items-center justify-center gap-2 w-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AiFillGithub size={24} />
          <span>Login with GitHub</span>
        </motion.button>

        <p className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-sky-500 hover:underline">
            Register here
          </Link>
        </p>
      </motion.div>
    </motion.div>
  )
}
