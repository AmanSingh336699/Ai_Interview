import { motion } from "framer-motion";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextareaFieldProps {
    label: string;
    register: UseFormRegisterReturn;
    error?: string;
    placeholder?: string;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ label, register, error, placeholder }) => {
    return(
        <motion.div className="flex flex-col text-white" initial={{ opacity: 0, y: 10 }} animate={{ opacity:1, y: 0 }} transition={{ duration: 0.5 }}>
            <label className="text-white font-semibold">{label}</label>
            <motion.textarea {...register} placeholder={placeholder || "Type your answer here..."} className="mt-1 p-3 border text-white border-gray-600 bg-gray-800 rounded-lg text-gray-600 transition-all"
                whileFocus={{ scale: 1.02, borderColor: "#3B82F6" }} />
            {error && <motion.p className="text-red-700 text-sm mt-1" initial={{opacity: 0}} animate={{ opacity: 1}}>
                {error}
            </motion.p>}
        </motion.div>
    )
}

export default TextareaField