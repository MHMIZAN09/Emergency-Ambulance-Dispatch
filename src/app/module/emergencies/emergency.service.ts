import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { IRequestUser } from "../auth/auth.interface";
import type {
	IAssignHospitalPayload,
	IEmergencyPayload,
	IEmergencyUpdatePayload,
} from "./emergency.interface";

const createEmergency = async (payload: IEmergencyPayload, userId: string) => {
	const {
		patientName,
		patientAge,
		bloodGroup,
		description,
		priority,
		pickupAddress,
		pickupLat,
		pickupLng,
	} = payload;

	const user = await prisma.user.findUnique({
		where: {
			id: userId,
		},
	});

	if (!user) {
		throw new AppError(404, "User not found, please login or register");
	}

	if (user.role !== Role.REQUESTER) {
		throw new AppError(403, "You are not authorized to create an emergency");
	}

	if (user.status !== "ACTIVE") {
		throw new AppError(
			403,
			"Your account is not active, please contact support",
		);
	}

	const emergency = await prisma.emergencyRequest.create({
		data: {
			userId: user.id,
			patientName,
			patientAge,
			bloodGroup,
			description,
			priority,
			pickupAddress,
			pickupLat,
			pickupLng,
		},
	});

	return emergency;
};

//! Todo : limit, pagination, sorting, filtering pending
const getMyEmergencies = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: {
			id: userId,
			deletedAt: null,
		},
	});

	if (!user) {
		throw new AppError(404, "User not found, please login or register");
	}

	if (user.role !== Role.REQUESTER) {
		throw new AppError(403, "You are not authorized to view emergencies");
	}

	if (user.status !== "ACTIVE") {
		throw new AppError(
			403,
			"Your account is not active, please contact support",
		);
	}
	if (user.isDeleted === true) {
		throw new AppError(403, "Your account has been deleted");
	}

	const emergencies = await prisma.emergencyRequest.findMany({
		where: {
			userId: user.id,
		},
		include: {
			dispatches: true,
			hospital: true,
			user: {
				omit: {
					password: true,
				},
			},
			payments: true,
		},
	});

	return emergencies;
};

//! Todo : limit, pagination, sorting, filtering pending
const getAllEmergencies = async () => {
	const emergencies = await prisma.emergencyRequest.findMany({
		where: {
			deletedAt: null,
		},
		include: {
			dispatches: true,
			hospital: true,
			user: {
				omit: {
					password: true,
				},
			},
			payments: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
	return emergencies;
};

const getEmergencyById = async (emergencyId: string) => {
	const emergency = await prisma.emergencyRequest.findUnique({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
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
	});

	if (!emergency) {
		throw new AppError(404, "Emergency not found");
	}

	return emergency;
};

const updateEmergency = async (
	emergencyId: string,
	userId: string,
	payload: IEmergencyUpdatePayload,
) => {
	const emergency = await prisma.emergencyRequest.findFirst({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
	});

	if (!emergency) {
		throw new AppError(404, "Emergency not found");
	}

	if (emergency.userId !== userId) {
		throw new AppError(403, "You cannot update this emergency");
	}

	if (emergency.status !== "REQUESTED") {
		throw new AppError(409, "Only requested emergencies can be updated");
	}

	const updatedEmergency = await prisma.emergencyRequest.updateMany({
		where: {
			id: emergencyId,
			status: "REQUESTED",
			deletedAt: null,
		},
		data: {
			...payload,
		},
	});

	if (updatedEmergency.count === 0) {
		throw new AppError(
			409,
			"Emergency could not be updated. It may have been processed or deleted.",
		);
	}

	return await prisma.emergencyRequest.findFirstOrThrow({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
	});
};

//* Cancel Emergency
const cancelEmergency = async (emergencyId: string, user: IRequestUser) => {
	const result = await prisma.$transaction(async (tx) => {
		const emergency = await tx.emergencyRequest.findFirst({
			where: {
				id: emergencyId,
				deletedAt: null,
			},
			include: {
				dispatches: true,
			},
		});

		if (!emergency) {
			throw new AppError(404, "Emergency not found");
		}
		if (user.role === Role.REQUESTER && emergency.userId !== user.userId) {
			throw new AppError(403, "You are not allowed to cancel this emergency");
		}

		if (![Role.REQUESTER, Role.DISPATCHER, Role.ADMIN].includes(user.role)) {
			throw new AppError(403, "Permission denied");
		}

		if (emergency.status === "CANCELLED") {
			throw new AppError(409, "Emergency is already cancelled");
		}

		if (emergency.status === "COMPLETED") {
			throw new AppError(409, "Completed emergencies cannot be cancelled");
		}

		if (emergency.status === "AT_HOSPITAL") {
			throw new AppError(
				409,
				"Emergencies that have reached the hospital cannot be cancelled",
			);
		}

		const emergencyUpdate = await tx.emergencyRequest.updateMany({
			where: {
				id: emergency.id,
				status: emergency.status,
				deletedAt: null,
			},
			data: {
				status: "CANCELLED",
				cancelledAt: new Date(),
			},
		});

		if (emergencyUpdate.count === 0) {
			throw new AppError(409, "Emergency status changed. Please try again");
		}

		if (emergency.dispatches && emergency.dispatches.status !== "CANCELLED") {
			if (emergency.dispatches.status === "COMPLETED") {
				throw new AppError(
					409,
					"Cannot cancel emergency with completed dispatch",
				);
			}
		}

		const dispatchUpdate = await tx.dispatch.updateMany({
			where: {
				id: emergency.dispatches?.id,
				status: emergency.dispatches?.status,
			},
			data: {
				status: "CANCELLED",
				cancelledAt: new Date(),
			},
		});

		if (dispatchUpdate.count === 0) {
			throw new AppError(409, "Dispatch status changed. Please try again");
		}

		const activeDispatch = await tx.dispatch.findFirst({
			where: {
				ambulanceId: emergency.dispatches?.ambulanceId,
				id: { not: emergency.dispatches?.id },
				status: {
					notIn: ["COMPLETED", "CANCELLED"],
				},
			},
			select: { id: true },
		});

		if (!activeDispatch) {
			await tx.ambulance.update({
				where: { id: emergency.dispatches?.ambulanceId },
				data: { status: "AVAILABLE" },
			});
		}

		return tx.emergencyRequest.findFirstOrThrow({
			where: {
				id: emergencyId,
				deletedAt: null,
			},
			include: {
				hospital: true,
				dispatches: true,
				payments: true,
			},
		});
	});

	return result;
};

//* Verify Emergency */

const verifyEmergency = async (emergencyId: string) => {
	const emergency = await prisma.emergencyRequest.findFirst({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
	});

	if (!emergency) {
		throw new AppError(404, "Emergency not found");
	}

	if (emergency.status !== "REQUESTED") {
		throw new AppError(409, "Only requested emergencies can be verified");
	}

	const updatedEmergency = await prisma.emergencyRequest.updateMany({
		where: {
			id: emergencyId,
			deletedAt: null,
			status: "REQUESTED",
		},
		data: {
			status: "VERIFIED",
			verifiedAt: new Date(),
		},
	});

	if (updatedEmergency.count === 0) {
		throw new AppError(
			409,
			"Emergency could not be verified. It may have been processed or deleted.",
		);
	}

	return await prisma.emergencyRequest.findFirstOrThrow({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
	});
};

// * Assign Hospital to Emergency

const assignHospital = async (
	emergencyId: string,
	payload: IAssignHospitalPayload,
) => {
	const { hospitalId } = payload;

	const emergency = await prisma.emergencyRequest.findFirst({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
	});

	if (!emergency) {
		throw new AppError(404, "Emergency not found");
	}

	if (emergency.status !== "VERIFIED") {
		throw new AppError(
			409,
			"Only verified emergencies can be assigned to a hospital",
		);
	}

	const hospital = await prisma.hospital.findUnique({
		where: {
			id: hospitalId,
		},
		select: {
			id: true,
		},
	});

	if (!hospital) {
		throw new AppError(404, "Hospital not found");
	}

	const result = await prisma.emergencyRequest.updateMany({
		where: {
			id: emergencyId,
			deletedAt: null,
			status: "VERIFIED",
		},
		data: {
			hospitalId: hospital.id,
			status: "ASSIGNED",
			assignedAt: new Date(),
		},
	});

	if (result.count === 0) {
		throw new AppError(
			409,
			"Emergency could not be assigned to the hospital. It may have been processed or deleted.",
		);
	}

	return await prisma.emergencyRequest.findFirstOrThrow({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
	});
};

export const emergencyService = {
	createEmergency,
	getMyEmergencies,
	getAllEmergencies,
	getEmergencyById,
	updateEmergency,
	cancelEmergency,
	verifyEmergency,
	assignHospital,
};
