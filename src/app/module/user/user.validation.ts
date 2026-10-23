import z from "zod";

const updateUserSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters long")
		.max(100, "Name cannot exceed 100 characters")
		.optional(),
	phone: z
		.string()
		.regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
		.nullable()
		.optional(),
});

export const UserValidation = {
	updateUserSchema,
};
