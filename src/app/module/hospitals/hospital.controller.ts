import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { hospitalService } from "./hospital.service";

const createHospital = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const emergency = await hospitalService.createHospital(payload );

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Emergency created successfully",
		data: emergency,
	});
});

//! Todo: Add pagination and filtering , sorting, limit
const getAllHospitals = catchAsync(async (req: Request, res: Response) => {
	const emergencies = await hospitalService.getAllHospitals();

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Emergencies retrieved successfully",
		data: emergencies,
	});
});

const getNearbyHospitals = catchAsync(
	async (req: Request, res: Response) => {},
);

const getHospitalById = catchAsync(async (req: Request, res: Response) => {
	const hospitalId = req.params.id;

	const hospital = await hospitalService.getHospitalById(hospitalId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Hospital retrieved successfully",
		data: hospital,
	});
});

const updateHospital = catchAsync(async (req: Request, res: Response) => {
	const hospitalId = req.params.id;
	const payload = req.body;

	const hospital = await hospitalService.updateHospital(hospitalId as string, payload);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Hospital updated successfully",
		data: hospital,
	});
});

const deleteHospital = catchAsync(async (req: Request, res: Response) => {
	const hospitalId = req.params.id;
	await hospitalService.deleteHospital(hospitalId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Hospital deleted successfully",
		data: null,
	});
});

export const hospitalController = {
	createHospital,
	getAllHospitals,
	getNearbyHospitals,
	getHospitalById,
	updateHospital,
	deleteHospital,
};
