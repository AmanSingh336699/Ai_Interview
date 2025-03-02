"use client"

import TextareaField from "@/components/TextareaField"
import Loader from "@/components/ui/Loader"
import { withAuth } from "@/components/withAuth"
import api from "@/lib/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { useParams, useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { FaCheckCircle, FaLightbulb, FaPaperPlane, FaQuestionCircle } from "react-icons/fa"
import {z} from "zod"

const answerSchema = z.object({
    answer: z.string().min(5, "Answer must be at least 5 characters")
})

type AnswerFormType = z.infer<typeof answerSchema>

function InterviewProcess(){
    const { id } = useParams()
    const router = useRouter()
    const [question, setQuestion] = useState<string[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [hint, setHint] = useState("")
    const [totalHints, setTotalHints] = useState(3)
    const [usedHints, setUsedHints] = useState<Record<string, boolean>>({})
    const [completed, setCompleted] = useState(false)

    const { register, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<AnswerFormType>({
        defaultValues: { answer: ""},
        resolver: zodResolver(answerSchema)
    })

    useEffect(() => {
        if(!id) return

        const fetchQuestions = async () => {
            try {
                const res = await api.get(`/api/interview/question?interviewId=${id}`)
                console.log("question length", question.length, currentIndex)
                setQuestion(res.data.questions)
            } catch (error) {
                console.log("error", error)
            }
        }
        fetchQuestions()
    }, [id])

    const currentQuestion = question[currentIndex] || ""

    const requestHint = useCallback(async () => {
        if(totalHints === 0 || usedHints[currentQuestion]) return;
        try {
            const res = await api.post("/api/interview/hint", { currentQuestion })
            if(res.data.hint){
                setHint(res.data.hint)
                setTotalHints(prev => prev - 1)
                setUsedHints(prev => ({ ...prev, [currentQuestion]: true }))
                toast.success("Hint unlocked!", {
                    duration: 2500,
                    position: "top-center",
                    style: {
                        background: "#1a1a2e",
                        color: "#fbc531",
                        fontWeight: "bold",
                        borderRadius: "8px",
                    }
                })
            }
        } catch (error) {
            toast.error("Failed to get hint")
        }
    },[id, currentQuestion, totalHints, usedHints])

    const submitAnswer = useCallback(async (data: AnswerFormType) => {
        const currentQuestion = question[currentIndex]
        if(!currentQuestion){
            toast.error("No current question to answer!")
            return;
        }
        try {
           const res = await api.post("/api/interview/answer", { interviewId: id, question: currentQuestion, answer: data.answer })
           console.log("res data", res.data)
            if(currentIndex + 1 < question.length) {
                setCurrentIndex(prev => prev + 1)
                setHint("")
                setValue("answer", "")
                toast.success("Answer Submitted!", {
                    duration: 2000,
                    position: "top-center",
                    icon: <FaPaperPlane className="h-6 w-6 text-sky-500" />
                })
            } else {
                setCompleted(true)
                router.push(`/summery/${id}`)
                toast.success("Interview Completed!", {
                    duration: 3000,
                    position: "top-center",
                    icon: <FaCheckCircle className="h-6 w-6 text-emerald-500" />
                })
            }
        } catch (error) {
            toast.error("Failed to submit Answer!")
            console.log("error submitting answer", error)
        }
    },[id, question, router, currentIndex])

    const canRequestHint = useMemo(() => 
        totalHints > 0 && !usedHints[currentQuestion], [totalHints, usedHints, currentQuestion])

    return (
        <motion.div className="p-6 min-h-screen sm:p-6 flex flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <motion.h1 className="text-2xl sm:text-4xl font-bold mb-6 flex items-center drop-shadow-lg"
             initial={{y: -20, opacity: 0}} animate={{y:0, opacity: 1}} transition={{duration:0.5}}>
                <FaQuestionCircle className="mr-2 text-sky-400 sm:mr-3" />
                AI interview
            </motion.h1>
            {completed ? <motion.p className="text-lg sm:text-xl text-emerald-400 flex items-center drop-shadow-md" initial={{opacity: 0}}
                animate={{opacity: 1}} transition={{ duration: 0.5 }}>Interview Completed!</motion.p> : (
                <>
                    <motion.p className="text-base sm:text-lg mt-4 bg-white/10 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-md flex items-center" initial={{y: 10, opacity: 0}}
                    animate={{y: 0, opacity: 1}} transition={{ duration: 0.5 }}>
                        <FaQuestionCircle className="mr-2 text-sky-400" /> {currentQuestion}
                    </motion.p>
                    {canRequestHint && (
                        <motion.button onClick={requestHint} className="mt-4 px-4 sm:px-6 sm:py-3 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 transition-all duration-200 text-white shadow-lg flex items-center"
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <FaLightbulb className="mr-2" />
                            Ask Hint({totalHints} left)
                        </motion.button>
                    )}
                    {hint && (
                        <motion.p className="mt-4 text-yellow-300 bg-black/30 px-4 py-2 rounded-lg flex items-center"
                         initial={{opacity: 0, y: 5}} animate={{opacity: 1, y: 0}} transition={{ duration: 0.4}}>
                            <FaLightbulb className="mr-2 text-yellow-300" />
                            {hint}
                         </motion.p>
                    )}
                    <form onSubmit={handleSubmit(submitAnswer)} className="mt-6 w-full max-w-md sm:max-w-lg">
                        <TextareaField label="Your Answer" register={register("answer")} error={errors.answer?.message} />
                        <motion.button type="submit" className="mt-4 bg-emerald-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-white hover:bg-emerald-400 transition-all duration-200 shadow-lg w-full flex items-center justify-center"
                         disabled={isSubmitting} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                            <FaPaperPlane className="mr-2" />
                            {isSubmitting ? <Loader size={24} button={true} /> : "Submit Answer"}
                         </motion.button>
                    </form>
                </>)}
        </motion.div>
    )
}

export default withAuth(InterviewProcess)