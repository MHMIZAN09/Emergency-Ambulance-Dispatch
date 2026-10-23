import { prisma } from "../../lib/prisma";
import type { IUserUpdatePayload } from "./user.interface";

const updateUser = async (id: string, payload: IUserUpdatePayload) => {
	const { name, phone } = payload;

	// Update the user in the database
	const updatedUser = await prisma.user.update({
		where: { id },
		data: {
			name,
			phone,
		},
		omit: {
			password: true,
		},
	});

	return updatedUser;
};

const getAllUsers = async () => {
	// Fetch all users from the database
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			role: true,
		},
	});

	return users;
};

export const UserService = {
	updateUser,
	getAllUsers,
};
