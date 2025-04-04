import { z } from 'zod';

export const updateSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(15, "Username must be less than 15 characters")
    .optional(),
  email: z.string()
    .email("Invalid email address")
    .optional(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  confirmPassword: z.string().optional(),
})
.refine((data) => {
  return Object.keys(data).some(key => data[key as keyof typeof data] !== undefined && data[key as keyof typeof data] !== "");
}, {
  message: "At least one field must be filled",
})
.refine((data) => {
  if (data.password) {
    return data.confirmPassword && data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type ProfileFormData = z.infer<typeof updateSchema>;
