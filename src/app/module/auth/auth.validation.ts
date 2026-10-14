import z from "zod";

const RegistrationZodSchema = z.object({
  name: z
    .string("Name must be a string")
    .min(3, "Name must be at least 3 characters long")
    .max(100, "Name cannot exceed 100 characters"),

  email: z.email("Please provide a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
    .regex(/[0-9]/, "Password must contain at least 1 number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least 1 special character",
    ),

  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
    .optional(),
});

const LoginZodSchema = z.object({
  email: z.email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const UserValidation = {
  RegistrationZodSchema,
  LoginZodSchema,
};
