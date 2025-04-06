import React from 'react';
import { motion } from 'framer-motion';
import { UseFormRegister, FieldError, Path } from 'react-hook-form';

interface InputFieldProps<T extends Record<string, any>> {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error?: FieldError;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}

const InputField = <T extends Record<string, any>>({
  label,
  name,
  register,
  error,
  type = 'text',
  placeholder,
  icon,
}: InputFieldProps<T>) => {
  const inputClass = `mt-2 p-3 bg-gray-700 rounded-lg text-gray-200 focus:border-sky-400 focus:outline-none transition duration-200 ease-in-out w-full ${
    icon ? 'pl-10' : ''
  }`;

  return (
    <motion.div
      className="flex flex-col"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="text-white font-bold">{label}</label>
      <div className="relative">
        <input
          type={type}
          {...register(name)}
          className={inputClass}
          placeholder={placeholder}
        />
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-rose-500 text-sm mt-1">{error.message}</p>}
    </motion.div>
  );
};

export default InputField;