"use client"

import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"
import React, { useCallback, useState } from "react"
import api from "@/lib/api"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { RegisterValues, registerSchema } from "@/lib/validationSchema"
import Loader from "@/components/ui/Loader"

interface FormData {
    username: string;
    email: string;
    password: string;
}

export default function RegisterPage(){
    const {register, handleSubmit, formState: { errors, isSubmitting }} = useForm<RegisterValues>({ resolver: zodResolver(registerSchema)})
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const onSubmit = useCallback(
        async (data: FormData) => {
            try {
                await api.post(`/api/register`, data)
                toast.success("Account successfully registered!")
                setTimeout(() => router.push("/login"), 1500)
            } catch (_error) {
                console.log(_error)
                toast.error("Register failed")
            }
        }
    ,[router])
    

    const toggleEye = useCallback(() => setShowPassword(prev => !prev), [])

    return(
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center bg-gray-100 min-h-screen p-6">
            <motion.div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" initial={{ opacity: 1, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} >
                <motion.form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" initial={{ scale: 0.9 }} transition={{ duration: 0.3 }}>
                    <h1 className="text-3xl font-semibold text-center mb-6 text-gray-700">Register</h1>
                    <div className="relative" >
                        <motion.input {...register("username")} placeholder="Username" whileFocus={{ scale: 1.05 }} className={`border ${errors.username ? "border-rose-500" : "border-gray-300"} p-3 text-gray-800 rounded-lg w-full focus:outline-none`} />
                        {errors.username && (<motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-500 text-sm">{errors.username.message}</motion.p>)}
                    </div>
                    <div className="relative mt-4">
                        <motion.input {...register("email")} placeholder="Email" whileFocus={{ scale: 1.05 }} className={`border ${errors.email ? "border-rose-500" : "border-gray-300"} p-3 text-gray-800 rounded-lg w-full focus:outline-none`} />
                        {errors.email && (<motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-500 text-sm">{errors.email.message}</motion.p>)}
                    </div>
                    <div className="relative mt-4">
                        <motion.input {...register("password")} whileFocus={{ scale: 1.05 }} type={showPassword ? "text" : "password"} placeholder="Password" className={`border ${errors.password ? "border-rose-500" : "border-gray-300"} p-3 text-gray-800 rounded-lg w-full focus:outline-none`} />
                        <span className="absolute top-3 right-3 cursor-pointer" onClick={toggleEye}>{showPassword ? <AiFillEyeInvisible size={22} className="text-sky-400" /> : <AiFillEye size={22} className="text-sky-400" />}</span>
                        {errors.password && (<motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-rose-500 text-sm">{errors.password.message}</motion.p>)}
                    </div>
                    <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-emerald-500 text-white p-2 rounded-lg transition-all disabled:bg-gray-400 font-medium hover:bg-green-700">
                        {isSubmitting ? <Loader size={24} button={true} /> : "Register"}
                    </motion.button>
                </motion.form>
                <p className="mt-4 text-center text-gray-600">you have an account?{" "}
                    <Link href="/login" className="text-sky-500 hover:underline">Login here</Link>
                </p>
            </motion.div>
        </motion.div>
    )
}