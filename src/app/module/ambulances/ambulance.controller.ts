import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createAmbulance = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const ambulance = await ambulanceService.createAmbulance(payload);

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Ambulance created successfully",
		data: ambulance,
	});
});

const getAllAmbulances = catchAsync(async (req: Request, res: Response) => {
	const ambulances = await ambulanceService.getAllAmbulances();

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Ambulances retrieved successfully",
		data: ambulances,
	});
});
