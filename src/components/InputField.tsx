import React, { useMemo } from 'react'
import { motion } from 'framer-motion';

interface InputFieldProps {
    label: string;
    name: string;
    register: any;
    error?: any;
    type?: string;
    placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, register, error, type = "text", placeholder }) => {
    const inputClass = useMemo(
        () => `mt-2 p-3 bg-gray-600 rounded-lg text-gray-200 focus:border-sky-400 focus:outline-none
        transition duration-200 ease-in-out w-full`, [])
    return(
        <motion.div className=" flex flex-col" initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}}
        transition={{duration: 0.3}}>
            <label className="text-gray-300 font-bold">{label}</label>
            <input type={type} { ...register(name) } className={inputClass} placeholder={placeholder} />
            {error && <p className="text-rose-500 text-sm mt-1">{error.message}</p>}
        </motion.div>
    )
}

export default InputField