import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ambulanceService } from "./ambulance.service";

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

const getAmbulanceById = catchAsync(async (req: Request, res: Response) => {
	const ambulanceId = req.params.id;

	const ambulance = await ambulanceService.getAmbulanceById(
		ambulanceId as string,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Ambulance retrieved successfully",
		data: ambulance,
	});
});

const updateAmbulance = catchAsync(async (req: Request, res: Response) => {
	const ambulanceId = req.params.id;
	const payload = req.body;

	const ambulance = await ambulanceService.updateAmbulance(
		ambulanceId as string,
		payload,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Ambulance updated successfully",
		data: ambulance,
	});
});

const deleteAmbulance = catchAsync(async (req: Request, res: Response) => {
	const ambulanceId = req.params.id;

	await ambulanceService.deleteAmbulance(ambulanceId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Ambulance deleted successfully",
		data: null,
	});
});

const getAvailableAmbulances = catchAsync(
	async (req: Request, res: Response) => {
		const ambulances = await ambulanceService.getAvailableAmbulances();

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Available ambulances retrieved successfully",
			data: ambulances,
		});
	},
);

const updateAmbulanceStatus = catchAsync(
	async (req: Request, res: Response) => {
		const ambulanceId = req.params.id;
		const payload = req.body;

		const ambulance = await ambulanceService.updateAmbulanceStatus(
			ambulanceId as string,
			payload,
		);

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Ambulance status updated successfully",
			data: ambulance,
		});
	},
);

const updateAmbulanceLocation = catchAsync(
	async (req: Request, res: Response) => {
		const ambulanceId = req.params.id;
		const payload = req.body;

		const ambulance = await ambulanceService.updateAmbulanceLocation(
			ambulanceId as string,
			payload,
		);

		sendResponse(res, {
			statusCode: 200,
			success: true,
			message: "Ambulance location updated successfully",
			data: ambulance,
		});
	},
);

export const ambulanceController = {
	createAmbulance,
	getAllAmbulances,
	getAmbulanceById,
	updateAmbulance,
	deleteAmbulance,
	getAvailableAmbulances,
	updateAmbulanceStatus,
	updateAmbulanceLocation,
};
