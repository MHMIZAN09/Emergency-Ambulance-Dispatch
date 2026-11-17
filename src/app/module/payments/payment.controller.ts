import type { Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const getAuthenticatedUserId = (req: Request) => {
	const userId = req.user?.userId;

	if (!userId) {
		throw new AppError(401, "Authentication is required");
	}

	return userId;
};

const createPayment = catchAsync(async (req: Request, res: Response) => {
	const payment = await paymentService.createPayment(
		getAuthenticatedUserId(req),
		req.body,
	);

	sendResponse(res, {
		statusCode: 201,
		success: true,
		message: "Payment created successfully",
		data: payment,
	});
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
	const payments = await paymentService.getAllPayments(
		getAuthenticatedUserId(req),
		req.query,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Payments retrieved successfully",
		data: payments,
	});
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
	const payment = await paymentService.getPaymentById(
		getAuthenticatedUserId(req),
		req.params.id as string,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Payment retrieved successfully",
		data: payment,
	});
});

const updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
	const payment = await paymentService.updatePaymentStatus(
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "Payment status updated successfully",
		data: payment,
	});
});

export const paymentController = {
	createPayment,
	getAllPayments,
	getPaymentById,
	updatePaymentStatus,
};
