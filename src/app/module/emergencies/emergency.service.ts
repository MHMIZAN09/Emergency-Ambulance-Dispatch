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
	});

	return emergencies;
};

//! Todo : limit, pagination, sorting, filtering pending
const getAllEmergencies = async () => {
	const emergencies = await prisma.emergencyRequest.findMany();
	return emergencies;
};

const getEmergencyById = async (emergencyId: string) => {
	const emergency = await prisma.emergencyRequest.findUnique({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
		include: {
			user: true,
			hospital: true,
			dispatches: true,
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
			userId: userId,
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
	const emergency = await prisma.emergencyRequest.findFirst({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
	});

	if (!emergency) {
		throw new AppError(404, "Emergency not found");
	}

	if (user.role === Role.REQUESTER && emergency.userId !== user.userId) {
		throw new AppError(403, "You cannot cancel this emergency");
	}

	if (emergency.status === "CANCELLED" || emergency.status === "COMPLETED") {
		throw new AppError(409, "Emergency cannot be cancelled");
	}

	const updatedEmergency = await prisma.emergencyRequest.updateMany({
		where: {
			id: emergencyId,
			deletedAt: null,
			status: emergency.status,
		},
		data: {
			status: "CANCELLED",
			cancelledAt: new Date(),
		},
	});

	if (updatedEmergency.count === 0) {
		throw new AppError(
			409,
			"Emergency could not be cancelled. It may have been processed or deleted.",
		);
	}

	return await prisma.emergencyRequest.findFirstOrThrow({
		where: {
			id: emergencyId,
			deletedAt: null,
		},
	});
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
