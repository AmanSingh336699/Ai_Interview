"use client"

import {z} from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react"
import api from "@/lib/api"
import toast from "react-hot-toast"
import InputField from "@/components/InputField"
import { motion } from "framer-motion"
import { FaPlay } from "react-icons/fa"
import { withAuth } from "@/components/withAuth"
import Loader from "@/components/ui/Loader"


const schema = z.object({
    role: z.string().min(3, "Role is required"),
    experience: z.string().min(1, "Experience is required"),
    techStack: z.string().min(3, "Tech Stack is required"),
})

function StartInterview(){
    const router = useRouter()
    const { data: session } = useSession()
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
    })

    const startInterview = useCallback(async (data: any) => {
        try {
            const res = await api.post("/api/interview/start", { userId: session?.user?.id, ...data });
            console.log("resData: " + res.data)
            if(res.data?.interviewId){
                router.push(`/interview/${res.data.interviewId}`)
                toast.success("Interview started successfully")
            }
        } catch (_error) {
            toast.error("error to start interview")
            console.error(_error)
        }
    },[])

    return(
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 px-6">
            <motion.div initial={{opacity: 0, y: -20}} animate={{opacity:1, y: 0}}
            transition={{duration: 0.6, ease: "easeOut"}} className="bg-gray-900 shadow-lg rounded-xl p-8 w-full max-w-lg">
                <h1 className="text-3xl font-extrabold text-gray-100 text-center mb-6">Start New Interview</h1>
                <form onSubmit={handleSubmit(startInterview)} className="space-y-6">
                    <InputField placeholder="e.g., Frontend Developer" label="Role" name="role" register={register} error={errors.role} />
                    <InputField placeholder="e.g., 3+ year" label="Experience" name="experience" register={register} error={errors.experience} />
                    <InputField placeholder="e.g., React, Node.js, MongoDB" label="Tech Stack" name="techStack" register={register} error={errors.techStack} />
                    <motion.button type="submit" disabled={isSubmitting} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center justify-center bg-sky-500 px-6 py-3 rounded-lg text-white text-lg hover:bg-sky-600
                     disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isSubmitting ? <Loader size={24} button={true} /> : <>
                            <FaPlay className="mr-2" /> Start Interview
                        </>}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    )
}

export default withAuth(StartInterview)