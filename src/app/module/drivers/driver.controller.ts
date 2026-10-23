import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { driverService } from "./driver.service";

const assignAmbulanceToDriver = catchAsync(
	async (req: Request, res: Response) => {
		const driverId = req.params.id;
		const payload = req.body;

		const driver = await driverService.assignAmbulanceToDriver(
			driverId as string,
			payload,
		);

		sendResponse(res, {
			statusCode: 200,
			success: true,

			message: "Ambulance assigned to driver successfully",
			data: driver,
		});
	},
);

const createDriver = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const driver = await driverService.createDriver(payload);

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Driver created successfully",
		data: driver,
	});
});

const getAllDrivers = catchAsync(async (req: Request, res: Response) => {
	const drivers = await driverService.getAllDrivers();

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Drivers retrieved successfully",
		data: drivers,
	});
});

const getDriverById = catchAsync(async (req: Request, res: Response) => {
	const driverId = req.params.id;

	const driver = await driverService.getDriverById(driverId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Driver retrieved successfully",
		data: driver,
	});
});

const updateDriver = catchAsync(async (req: Request, res: Response) => {
	const driverId = req.params.id;
	const payload = req.body;

	const driver = await driverService.updateDriver(driverId as string, payload);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Driver updated successfully",
		data: driver,
	});
});

const deleteDriver = catchAsync(async (req: Request, res: Response) => {
	const driverId = req.params.id;

	await driverService.deleteDriver(driverId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Driver deleted successfully",
		data: null,
	});
});

export const driverController = {
	assignAmbulanceToDriver,
	createDriver,
	getAllDrivers,
	getDriverById,
	updateDriver,
	deleteDriver,
};
