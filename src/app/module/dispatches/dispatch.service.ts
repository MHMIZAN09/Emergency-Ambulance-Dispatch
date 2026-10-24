import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type {
	ICancelDispatchPayload,
	IDispatchPayload,
	IUpdateDispatchStatusPayload,
} from "./dispatch.interface";

const createDispatch = async (
	payload: IDispatchPayload,
	assignedById: string,
) => {
	const { emergencyId, ambulanceId } = payload;

	const result = prisma.$transaction(async (tx) => {
		const emergency = await tx.emergencyRequest.findUnique({
			where: { id: emergencyId },
		});

		if (!emergency) {
			throw new AppError(404, "Emergency not found");
		}

		const ambulance = await tx.ambulance.findUnique({
			where: { id: ambulanceId },
		});

		if (!ambulance) {
			throw new AppError(404, "Ambulance not found");
		}

		if (ambulance.status !== "AVAILABLE") {
			throw new AppError(400, "Ambulance is not available");
		}
		console.log("Emergency ID:", emergencyId);
		console.log("Emergency Status:", emergency.status);

		if (emergency.status !== "VERIFIED" && emergency.status !== "ASSIGNED") {
			throw new AppError(
				409,
				"Only verified or hospital-assigned emergencies can be dispatched",
			);
		}

		const existingDispatch = await tx.dispatch.findFirst({
			where: {
				emergencyId,
			},
		});

		if (existingDispatch) {
			throw new AppError(400, "A dispatch already exists for this emergency");
		}

		const dispatch = await tx.dispatch.create({
			data: {
				emergencyId,
				ambulanceId,
				assignedById,
			},
		});

		await tx.ambulance.update({
			where: { id: ambulanceId },
			data: { status: "BUSY" },
		});

		await tx.emergencyRequest.update({
			where: { id: emergencyId },
			data: { status: "ASSIGNED" },
		});

		return dispatch;
	});

	return result;
};

const getAllDispatches = async () => {
	const dispatches = await prisma.dispatch.findMany({
		where: {
			status: {
				not: "CANCELLED",
			},
		},
		include: {
			emergency: {
				include: {
					user: {
						omit: {
							password: true,
						},
					},
					hospital: true,
					dispatches: true,
					payments: true,
				},
			},
			ambulance: true,
			assignedBy: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
	return dispatches;
};

const getDispatchById = async (dispatchId: string) => {
	const dispatch = await prisma.dispatch.findUnique({
		where: { id: dispatchId },
		include: {
			emergency: true,
			ambulance: true,
			assignedBy: {
				select: {
					id: true,
					name: true,
					email: true,
					role: true,
				},
			},
		},
	});

	if (!dispatch) {
		throw new AppError(404, "Dispatch not found");
	}
	return dispatch;
};

const updateDispatchStatus = async (
	dispatchId: string,
	payload: IUpdateDispatchStatusPayload,
) => {
	const dispatch = await prisma.dispatch.findUnique({
		where: { id: dispatchId },
	});

	if (!dispatch) {
		throw new AppError(404, "Dispatch not found");
	}

	const transitions: Record<string, string[]> = {
		ASSIGNED: ["EN_ROUTE"],
		EN_ROUTE: ["PICKED_UP"],
		PICKED_UP: ["AT_HOSPITAL"],
		AT_HOSPITAL: ["COMPLETED"],
	};
	const allowedNextStatuses = transitions[dispatch.status] ?? [];

	if (!allowedNextStatuses.includes(payload.status)) {
		throw new AppError(
			409,
			`Dispatch cannot move from ${dispatch.status} to ${payload.status}`,
		);
	}

	const now = new Date();
	const timestampByStatus: Partial<
		Record<
			IUpdateDispatchStatusPayload["status"],
			{
				enRouteAt?: Date;
				pickedUpAt?: Date;
				arrivedAt?: Date;
				completedAt?: Date;
			}
		>
	> = {
		EN_ROUTE: { enRouteAt: now },
		PICKED_UP: { pickedUpAt: now },
		AT_HOSPITAL: { arrivedAt: now },
		COMPLETED: { completedAt: now },
	} as const;

	return prisma.$transaction(async (tx) => {
		const updatedDispatch = await tx.dispatch.update({
			where: { id: dispatchId },
			data: {
				status: payload.status,
				...timestampByStatus[payload.status],
			},
		});

		await tx.emergencyRequest.update({
			where: { id: dispatch.emergencyId },
			data: {
				status: payload.status,
				...(payload.status === "COMPLETED" ? { completedAt: now } : {}),
			},
		});

		if (payload.status === "COMPLETED") {
			await tx.ambulance.update({
				where: { id: dispatch.ambulanceId },
				data: { status: "AVAILABLE" },
			});
		}

		return updatedDispatch;
	});
};

const cancelDispatch = async (
	dispatchId: string,
	payload: ICancelDispatchPayload,
) => {
	const { reason } = payload;
	const result = prisma.$transaction(async (tx) => {
		const dispatch = await tx.dispatch.findUnique({
			where: { id: dispatchId },
		});

		if (!dispatch) {
			throw new AppError(404, "Dispatch not found");
		}

		if (dispatch.status === "CANCELLED" || dispatch.status === "COMPLETED") {
			throw new AppError(
				400,
				`Cannot cancel a dispatch that is already ${dispatch.status.toLowerCase()}`,
			);
		}

		const updatedDispatch = await tx.dispatch.update({
			where: { id: dispatchId },
			data: {
				status: "CANCELLED",
				cancelReason: reason,
				cancelledAt: new Date(),
			},
		});

		await tx.ambulance.update({
			where: { id: dispatch.ambulanceId },
			data: { status: "AVAILABLE" },
		});

		await tx.emergencyRequest.update({
			where: { id: dispatch.emergencyId },
			data: { status: "CANCELLED" },
		});

		return updatedDispatch;
	});
	return result;
};

export const dispatchService = {
	createDispatch,
	getAllDispatches,
	getDispatchById,
	updateDispatchStatus,
	cancelDispatch,
};
