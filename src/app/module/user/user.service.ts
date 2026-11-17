import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import type { IQueryParams } from "../../types/query.types";
import { AppError } from "../../utils/AppError";
import { PrismaQueryBuilder } from "../../utils/query-builder";
import type {
	IUserRoleUpdatePayload,
	IUserStatusUpdatePayload,
	IUserUpdatePayload,
} from "./user.interface";

const updateUser = async (id: string, payload: IUserUpdatePayload) => {
	const { name, phone } = payload;

	// Update the user in the database
	const existingUser = await prisma.user.findFirst({
		where: { id, deletedAt: null, isDeleted: false },
		select: { id: true },
	});

	if (!existingUser) {
		throw new AppError(404, "User not found");
	}

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

const getAllUsers = async (query: IQueryParams) => {
	return new PrismaQueryBuilder(query, {
		searchableFields: ["name", "email", "phone"],
		filterableFields: ["role", "status"],
		sortableFields: [
			"createdAt",
			"updatedAt",
			"name",
			"email",
			"role",
			"status",
		],
	})
		.search()
		.filter()
		.sort()
		.paginate()
		.execute(prisma.user, {
			where: { deletedAt: null },
			omit: {
				password: true,
			},
		});
};

const getUserById = async (id: string) => {
	// Fetch the user by ID from the database
	const user = await prisma.user.findFirst({
		where: {
			id,
			deletedAt: null,
			isDeleted: false,
		},
		omit: {
			password: true,
		},
	});
	if (!user) {
		throw new AppError(404, "User not found");
	}

	return user;
};

const updateUserStatus = async (
	id: string,
	payload: IUserStatusUpdatePayload,
) => {
	const { status } = payload;

	const existingUser = await prisma.user.findFirst({
		where: { id, deletedAt: null, isDeleted: false },
		select: { id: true, status: true },
	});

	if (!existingUser) {
		throw new AppError(404, "User not found");
	}

	const updatedUser = await prisma.user.update({
		where: { id },
		data: {
			status,
		},
		omit: {
			password: true,
		},
	});

	return updatedUser;
};

const updateUserRole = async (id: string, payload: IUserRoleUpdatePayload) => {
	const { role: newRole } = payload;

	const existingUser = await prisma.user.findFirst({
		where: { id, deletedAt: null, isDeleted: false },
		select: { id: true },
	});

	if (!existingUser) {
		throw new AppError(404, "User not found");
	}

	const updatedUser = await prisma.user.update({
		where: { id },
		data: {
			role: newRole,
		},
		omit: {
			password: true,
		},
	});

	return updatedUser;
};

const deleteUser = async (id: string, requesterId: string) => {
	if (id === requesterId) {
		throw new AppError(409, "You cannot delete your own admin account");
	}

	const user = await prisma.user.findFirst({
		where: { id, deletedAt: null, isDeleted: false },
		select: { id: true },
	});

	if (!user) {
		throw new AppError(404, "User not found");
	}

	await prisma.user.update({
		where: { id },
		data: {
			isDeleted: true,
			deletedAt: new Date(),
			status: "INACTIVE",
		},
	});
};

const getProfile = async (userId: string) => {
	const user = await prisma.user.findFirst({
		where: {
			id: userId,
			deletedAt: null,
		},
		omit: {
			password: true,
		},
	});

	if (!user) {
		throw new Error("User not found");
	}

	return user;
};

const getDashboardAnalytics = async (role: Role) => {
	const emergencyWhere = { deletedAt: null };
	const dispatchWhere = {};
	const ambulanceWhere = { deletedAt: null };
	const driverWhere = { deletedAt: null };
	const userWhere = { deletedAt: null, isDeleted: false };

	const [
		emergencyTotal,
		emergencyByStatus,
		emergencyByPriority,
		dispatchTotal,
		dispatchByStatus,
		ambulanceTotal,
		ambulanceByStatus,
		driverTotal,
		recentEmergencies,
		recentDispatches,
	] = await Promise.all([
		prisma.emergencyRequest.count({ where: emergencyWhere }),
		prisma.emergencyRequest.groupBy({
			by: ["status"],
			where: emergencyWhere,
			_count: { _all: true },
		}),
		prisma.emergencyRequest.groupBy({
			by: ["priority"],
			where: emergencyWhere,
			_count: { _all: true },
		}),
		prisma.dispatch.count({ where: dispatchWhere }),
		prisma.dispatch.groupBy({
			by: ["status"],
			where: dispatchWhere,
			_count: { _all: true },
		}),
		prisma.ambulance.count({ where: ambulanceWhere }),
		prisma.ambulance.groupBy({
			by: ["status"],
			where: ambulanceWhere,
			_count: { _all: true },
		}),
		prisma.driver.count({ where: driverWhere }),
		prisma.emergencyRequest.findMany({
			where: emergencyWhere,
			select: {
				id: true,
				patientName: true,
				priority: true,
				status: true,
				pickupAddress: true,
				createdAt: true,
			},
			orderBy: { createdAt: "desc" },
			take: 5,
		}),
		prisma.dispatch.findMany({
			where: dispatchWhere,
			select: {
				id: true,
				status: true,
				assignedAt: true,
				emergency: {
					select: { id: true, patientName: true, priority: true },
				},
				ambulance: {
					select: { id: true, licensePlate: true },
				},
			},
			orderBy: { createdAt: "desc" },
			take: 5,
		}),
	]);

	const dashboard = {
		emergencies: {
			total: emergencyTotal,
			byStatus: emergencyByStatus,
			byPriority: emergencyByPriority,
		},
		dispatches: {
			total: dispatchTotal,
			byStatus: dispatchByStatus,
		},
		ambulances: {
			total: ambulanceTotal,
			byStatus: ambulanceByStatus,
		},
		drivers: {
			total: driverTotal,
		},
		recentEmergencies,
		recentDispatches,
	};

	if (role === Role.ADMIN) {
		const [userTotal, usersByRole, paymentTotal, paymentsByStatus] =
			await Promise.all([
				prisma.user.count({ where: userWhere }),
				prisma.user.groupBy({
					by: ["role"],
					where: userWhere,
					_count: { _all: true },
				}),
				prisma.payment.count({
					where: { emergency: { deletedAt: null } },
				}),
				prisma.payment.groupBy({
					by: ["status"],
					where: { emergency: { deletedAt: null } },
					_count: { _all: true },
				}),
			]);

		return {
			role,
			...dashboard,
			users: { total: userTotal, byRole: usersByRole },
			payments: { total: paymentTotal, byStatus: paymentsByStatus },
		};
	}

	return {
		role,
		...dashboard,
	};
};

export const UserService = {
	updateUser,
	getAllUsers,
	getUserById,
	updateUserStatus,
	updateUserRole,
	deleteUser,
	getProfile,
	getDashboardAnalytics,
};
