import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { IRequestUser } from "../auth/auth.interface";
import type { IAssignHospitalPayload } from "./emergency.interface";
import { emergencyService } from "./emergency.service";

const createEmergency = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const userId = req.user?.userId;
	const result = await emergencyService.createEmergency(
		payload,
		userId as string,
	);

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Emergency created successfully",
		data: result,
	});
});

const getMyEmergencies = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId;

	const result = await emergencyService.getMyEmergencies(userId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "My emergencies retrieved successfully",
		data: result,
	});
});

const getAllEmergencies = catchAsync(async (req: Request, res: Response) => {
	const result = await emergencyService.getAllEmergencies();

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "All emergencies retrieved successfully",
		data: result,
	});
});

const getEmergencyById = catchAsync(async (req: Request, res: Response) => {
	const emergencyId = req.params.id;
	const result = await emergencyService.getEmergencyById(emergencyId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Emergency retrieved successfully",
		data: result,
	});
});

const updateEmergency = catchAsync(async (req: Request, res: Response) => {
	const emergencyId = req.params.id;
	const payload = req.body;
    const userId = req.user?.userId;
	const result = await emergencyService.updateEmergency(
		emergencyId as string,
        userId as string,
		payload,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Emergency updated successfully",

		data: result,
	});
});

const cancelEmergency = catchAsync(async (req: Request, res: Response) => {
	const emergencyId = req.params.id;
    const user = req.user;
	const result = await emergencyService.cancelEmergency(emergencyId as string ,user as IRequestUser);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Emergency canceled successfully",
		data: result,
	});
});

const verifyEmergency = catchAsync(async (req: Request, res: Response) => {
	const emergencyId = req.params.id;

	const result = await emergencyService.verifyEmergency(emergencyId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Emergency verified successfully",
		data: result,
	});
});

const assignHospital = catchAsync(async (req: Request, res: Response) => {
	const emergencyId = req.params.id;
	const payload = req.body;

	const result = await emergencyService.assignHospital(
		emergencyId as string,
		payload as IAssignHospitalPayload,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Hospital assigned to emergency successfully",
		data: result,
	});
});

export const emergencyController = {
	createEmergency,
	getMyEmergencies,
	getAllEmergencies,
	getEmergencyById,
	updateEmergency,
	cancelEmergency,
	verifyEmergency,
	assignHospital,
};
