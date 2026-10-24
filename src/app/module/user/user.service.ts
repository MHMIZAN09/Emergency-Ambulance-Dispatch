import { prisma } from "../../lib/prisma";
import type { IUserRoleUpdatePayload, IUserStatusUpdatePayload, IUserUpdatePayload } from "./user.interface";

const updateUser = async (id: string, payload: IUserUpdatePayload) => {
	const { name, phone } = payload;

	// Update the user in the database
	const updatedUser = await prisma.user.update({
		where: { id, deletedAt: null },
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
		
		where: {
			deletedAt: null,
		},
		omit:{
			password: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return users;
};


const getUserById = async (id: string) => {
	// Fetch the user by ID from the database
	const user = await prisma.user.findFirst({
		where: {
			id,
			deletedAt: null,
			isDeleted: false,
		},
		omit:{
			password: true,
		},
	});
	if(!user){
		throw new Error("User not found");
	}
	
	return user;
};

const updateUserStatus = async (id: string, payload:IUserStatusUpdatePayload) => {
	const { status } = payload;

	const updatedUser = await prisma.user.update({
		where: { id, deletedAt: null },
		data: {
			status,
		},
		omit: {
			password: true,
		},
	});

	if (!updatedUser) {
		throw new Error("User not found");
	}

	return updatedUser;
};



const updateUserRole = async (id: string, payload: IUserRoleUpdatePayload) => {
	const { role: newRole } = payload;
	
	const updatedUser = await prisma.user.update({
		where: { id, deletedAt: null },
		data: {
			role: newRole,
		},
		omit: {
			password: true,
		},
	});

	if (!updatedUser) {
		throw new Error("User not found");
	}

	return updatedUser;
};


export const UserService = {
	updateUser,
	getAllUsers,
	getUserById,
	updateUserStatus,
	updateUserRole,
};
