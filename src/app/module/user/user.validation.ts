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

// enum Role {
//     REQUESTER
//     DISPATCHER
//     ADMIN
// }

// enum UserStatus {
//     ACTIVE
//     INACTIVE
//     SUSPENDED
// }

const updateUserStatusSchema = z.object({
	status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"], "Invalid status. Must be one of: ACTIVE, INACTIVE, SUSPENDED"),
	});

const updateUserRoleSchema = z.object({
	role: z.enum(["ADMIN", "USER", "DRIVER"], "Invalid role. Must be one of: ADMIN, USER, DRIVER"),
	});


export const UserValidation = {
	updateUserSchema,
	updateUserStatusSchema,
	updateUserRoleSchema,
};
