import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

const updateUser = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const actor = req.user;

	if (!actor || (actor.role !== "ADMIN" && actor.userId !== id)) {
		throw new AppError(403, "You can only update your own profile");
	}

	const payload = req.body;

	// Call the service to update the user
	const result = await UserService.updateUser(id as string, payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User updated successfully",
		data: result,
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	// Call the service to get all users
	const result = await UserService.getAllUsers(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users retrieved successfully",
		data: result,
	});
});

const getProfile = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId as string;
	const result = await UserService.getProfile(userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile retrieved successfully",
		data: result,
	});
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;

	// Call the service to get the user by ID
	const result = await UserService.getUserById(id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User retrieved successfully",
		data: result,
	});
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	if (req.user?.userId === id) {
		throw new AppError(409, "You cannot change your own account status");
	}

	// Call the service to update the user status
	const result = await UserService.updateUserStatus(id as string, payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User status updated successfully",
		data: result,
	});
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params;
	const payload = req.body;
	if (req.user?.userId === id) {
		throw new AppError(409, "You cannot change your own admin role");
	}

	// Call the service to update the user role
	const result = await UserService.updateUserRole(id as string, payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User role updated successfully",
		data: result,
	});
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
	await UserService.deleteUser(
		req.params.id as string,
		req.user?.userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User deleted successfully",
		data: null,
	});
});

const getProfileAnalytics = catchAsync(async (req: Request, res: Response) => {
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile analytics retrieved successfully",
		data: "",
	});
});

const getDashboardAnalytics = catchAsync(
	async (req: Request, res: Response) => {
		const role = req.user?.role;
		if (!role) {
			throw new AppError(401, "Authentication is required");
		}

		const result = await UserService.getDashboardAnalytics(role);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Dashboard analytics retrieved successfully",
			data: result,
		});
	},
);

export const UserController = {
	updateUser,
	getAllUsers,
	getUserById,
	updateUserStatus,
	updateUserRole,
	deleteUser,
	getProfile,
	getProfileAnalytics,
	getDashboardAnalytics,
};
