import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type {
	IHospitalPayload,
	IHospitalUpdatePayload,
} from "./hospital.interface";

const createHospital = async (payload: IHospitalPayload) => {
	const { name, address, phone, email, latitude, longitude, status } = payload;

	const existingHospital = await prisma.hospital.findFirst({
		where: {
			OR: [{ email: email }, { phone: phone }],
			deletedAt: null,
		},
		select: {
			id: true,
			email: true,
			phone: true,
		},
	});

	if (existingHospital) {
		throw new AppError(
			409,
			"Hospital with the same email or phone already exists",
		);
	}

	const hospital = await prisma.hospital.create({
		data: {
			name,
			address,
			phone,
			email,
			latitude,
			longitude,
			status: status || "OPEN",
		},
	});

	return hospital;
};

const getAllHospitals = async () => {
	const hospitals = await prisma.hospital.findMany({
		where: {
			deletedAt: null,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return hospitals;
};

const getHospitalById = async (hospitalId: string) => {
	const hospital = await prisma.hospital.findFirst({
		where: {
			id: hospitalId,
			deletedAt: null,
			status: "OPEN",
		},
	});

	if (!hospital) {
		throw new AppError(404, "Hospital not found");
	}

	return hospital;
};

const updateHospital = async (
	hospitalId: string,
	payload: IHospitalUpdatePayload,
) => {
	const hospital = await prisma.hospital.findFirst({
		where: {
			id: hospitalId,
			deletedAt: null,
		},
		select: {
			id: true,
		},
		
	});

	if (!hospital) {
		throw new AppError(404, "Hospital not found");
	}

	if (payload.email || payload.phone) {
		const duplicateHospital = await prisma.hospital.findFirst({
			where: {
				OR: [{ email: payload.email }, { phone: payload.phone }],
				id: { not: hospitalId },
				deletedAt: null,
			},
		});

		if (duplicateHospital) {
			throw new AppError(
				409,
				"Hospital with the same email or phone already exists",
			);
		}
	}

	const updatedHospital = await prisma.hospital.update({
		where: {
			id: hospitalId,
		},
		data: payload,
	});

	return updatedHospital;
};

const deleteHospital = async (hospitalId: string) => {
	const hospital = await prisma.hospital.findFirst({
		where: {
			id: hospitalId,
			deletedAt: null,
		},
	});

	if (!hospital) {
		throw new AppError(404, "Hospital not found");
	}

	const deletedHospital = await prisma.hospital.updateMany({
		where: {
			id: hospitalId,
			deletedAt: null,
		},
		data: {
			deletedAt: new Date(),
		},
	});

	if (deletedHospital.count === 0) {
		throw new AppError(404, "Hospital not found or already deleted");
	}

	return deletedHospital;
};

//! Get nearby hospitals after completed all module then fix this
const getNearbyHospitals = async () => {};

export const hospitalService = {
	createHospital,
	getAllHospitals,
	getHospitalById,
	updateHospital,
	deleteHospital,
	getNearbyHospitals,
};
