import {
	AmbulanceStatus,
	type AmbulanceType,
} from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type {
	IAmbulanceLocationPayload,
	IAmbulancePayload,
	IAmbulanceStatusPayload,
	IAmbulanceUpdatePayload,
} from "./ambulance.interface";

const createAmbulance = async (payload: IAmbulancePayload) => {
	const {
		licensePlate,
		model,
		manufacturer,
		year,
		type,
		capacity,
		status,
		latitude,
		longitude,
		baseFare,
		perKmFare,
	} = payload;
	const existingAmbulance = await prisma.ambulance.findUnique({
		where: {
			licensePlate: payload.licensePlate,
			deletedAt: null,
		},
	});

	if (existingAmbulance) {
		throw new AppError(409, "Ambulance with this license plate already exists");
	}

	const ambulance = await prisma.ambulance.create({
		data: {
			licensePlate,
			model,
			manufacturer,
			year,
			type: type as AmbulanceType,
			capacity,
			status: (status as AmbulanceStatus) || AmbulanceStatus.OFFLINE,
			latitude,
			longitude,
			baseFare,
			perKmFare,
		},
	});

	return ambulance;
};
const getAllAmbulances = async () => {
	const ambulances = await prisma.ambulance.findMany({
		where: {
			deletedAt: null,
		},
	});
	return ambulances;
};

const getAvailableAmbulances = async () => {
	const availableAmbulances = await prisma.ambulance.findMany({
		where: {
			status: AmbulanceStatus.AVAILABLE,
			deletedAt: null,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return availableAmbulances;
};

const getAmbulanceById = async (ambulanceId: string) => {
	const ambulance = await prisma.ambulance.findUnique({
		where: {
			id: ambulanceId,
			deletedAt: null,
		},
	});

	if (!ambulance) {
		throw new AppError(404, "Ambulance not found");
	}

	return ambulance;
};

const updateAmbulance = async (
	ambulanceId: string,
	payload: IAmbulanceUpdatePayload,
) => {
	const ambulance = await prisma.ambulance.findUnique({
		where: {
			id: ambulanceId,
			deletedAt: null,
		},
	});

	if (!ambulance) {
		throw new AppError(404, "Ambulance not found");
	}

	if (
		payload.status &&
		!Object.values(AmbulanceStatus).includes(payload.status as AmbulanceStatus)
	) {
		throw new AppError(400, "Invalid ambulance status");
	}

	if (payload.licensePlate) {
		const duplicateAmbulance = await prisma.ambulance.findUnique({
			where: {
				licensePlate: payload.licensePlate,
				deletedAt: null,
				NOT: {
					id: ambulanceId,
				},
			},
		});

		if (duplicateAmbulance) {
			throw new AppError(
				409,
				"Ambulance with this license plate already exists",
			);
		}
	}

	return prisma.ambulance.update({
		where: {
			id: ambulanceId,
		},
		data: {
			licensePlate: payload.licensePlate,
			model: payload.model,
			manufacturer: payload.manufacturer,
			year: payload.year,
			type: payload.type as AmbulanceType,
			capacity: payload.capacity,
			status: payload.status as AmbulanceStatus,
			latitude: payload.latitude,
			longitude: payload.longitude,
			baseFare: payload.baseFare,
			perKmFare: payload.perKmFare,
			updatedAt: new Date(),
		},
	});
};

const updateAmbulanceStatus = async (
	ambulanceId: string,
	payload: IAmbulanceStatusPayload,
) => {
	const { status } = payload;

	const ambulance = await prisma.ambulance.findFirst({
		where: {
			id: ambulanceId,
			deletedAt: null,
		},
	});

	if (!ambulance) {
		throw new AppError(404, "Ambulance not found");
	}

	if (!Object.values(AmbulanceStatus).includes(status as AmbulanceStatus)) {
		throw new AppError(400, "Invalid ambulance status");
	}

	if (ambulance.status === status) {
		throw new AppError(400, `Ambulance is already ${status}`);
	}

	if (ambulance.status === AmbulanceStatus.BUSY) {
		throw new AppError(400, "Busy ambulance status cannot be changed manually");
	}

	if (status === AmbulanceStatus.BUSY) {
		throw new AppError(
			400,
			"Busy status must be set through the dispatch workflow",
		);
	}

	if (
		ambulance.status === AmbulanceStatus.MAINTENANCE &&
		status === AmbulanceStatus.AVAILABLE
	) {
		throw new AppError(
			400,
			"Ambulance must be cleared from maintenance before becoming available",
		);
	}

	if (
		ambulance.status === AmbulanceStatus.OFFLINE &&
		status === AmbulanceStatus.MAINTENANCE
	) {
		throw new AppError(
			400,
			"Set the ambulance to available before maintenance",
		);
	}

	return prisma.ambulance.update({
		where: {
			id: ambulanceId,
		},
		data: {
			status: status as AmbulanceStatus,
		},
	});
};

const updateAmbulanceLocation = async (
	ambulanceId: string,
	payload: IAmbulanceLocationPayload,
) => {
	const { latitude, longitude } = payload;

	const ambulance = await prisma.ambulance.findUnique({
		where: {
			id: ambulanceId,
			deletedAt: null,
		},
	});

	if (!ambulance) {
		throw new AppError(404, "Ambulance not found");
	}

	const updatedAmbulance = await prisma.ambulance.update({
		where: {
			id: ambulanceId,
		},
		data: {
			latitude,
			longitude,
			lastLocationAt: new Date(),
		},
	});

	return updatedAmbulance;
};

const deleteAmbulance = async (ambulanceId: string) => {
	const ambulance = await prisma.ambulance.findUnique({
		where: {
			id: ambulanceId,
			deletedAt: null,
		},
	});

	if (!ambulance) {
		throw new AppError(404, "Ambulance not found");
	}

	if (ambulance.status === AmbulanceStatus.BUSY) {
		throw new AppError(
			400,
			"Cannot delete an ambulance that is currently busy",
		);
	}

	const deletedAmbulance = await prisma.ambulance.delete({
		where: {
			id: ambulanceId,
		},
	});

	return deletedAmbulance;
};

export const ambulanceService = {
	createAmbulance,
	getAllAmbulances,
	getAvailableAmbulances,
	getAmbulanceById,
	updateAmbulance,
	updateAmbulanceStatus,
	updateAmbulanceLocation,
	deleteAmbulance,
};
