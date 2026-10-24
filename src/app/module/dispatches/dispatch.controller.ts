import type { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { dispatchService } from "./dispatch.service";

const createDispatch = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const dispatch = await dispatchService.createDispatch(
		payload,
		req.user?.userId as string,
	);

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Dispatch created successfully",
		data: dispatch,
	});
});

const getAllDispatches = catchAsync(async (req: Request, res: Response) => {
	const dispatches = await dispatchService.getAllDispatches();

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Dispatches retrieved successfully",
		data: dispatches,
	});
});

const getDispatchById = catchAsync(async (req: Request, res: Response) => {
	const dispatchId = req.params.id;

	const dispatch = await dispatchService.getDispatchById(dispatchId as string);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Dispatch retrieved successfully",
		data: dispatch,
	});
});

const updateDispatchStatus = catchAsync(async (req: Request, res: Response) => {
	const dispatchId = req.params.id;
	const payload = req.body;

	const dispatch = await dispatchService.updateDispatchStatus(
		dispatchId as string,
		payload,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Dispatch status updated successfully",
		data: dispatch,
	});
});

const cancelDispatch = catchAsync(async (req: Request, res: Response) => {
	const dispatchId = req.params.id;
	const payload = req.body;

	const dispatch = await dispatchService.cancelDispatch(
		dispatchId as string,
		payload,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Dispatch cancelled successfully",
		data: dispatch,
	});
});

export const dispatchController = {
	createDispatch,
	getAllDispatches,
	getDispatchById,
	updateDispatchStatus,
	cancelDispatch,
};
