import { AmbulanceStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type {
	IDriverAmbulancePayload,
	IDriverPayload,
	IDriverUpdatePayload,
} from "./driver.interface";

const assignAmbulanceToDriver = async (
	driverId: string,
	payload: IDriverAmbulancePayload,
) => {
	const { ambulanceId } = payload;

	const existingDriver = await prisma.driver.findUnique({
		where: {
			id: driverId,
			deletedAt: null,
		},
	});

	if (!existingDriver) {
		throw new AppError(404, "Driver not found");
	}

	if (existingDriver.ambulanceId === ambulanceId) {
		throw new AppError(409, "Driver is already assigned to this ambulance");
	}

	if (ambulanceId) {
		const ambulance = await prisma.ambulance.findUnique({
			where: {
				id: ambulanceId,
				deletedAt: null,
			},
			include: {
				drivers: true,
			},
		});

		if (!ambulance) {
			throw new AppError(404, "Ambulance not found");
		}

		if (ambulance.status !== AmbulanceStatus.AVAILABLE) {
			throw new AppError(404, "Ambulance is not available for assignment");
		}

		if (ambulance.drivers && ambulance.drivers.deletedAt === null) {
			throw new AppError(
				409,
				"Ambulance is already assigned to another driver",
			);
		}
	}

	const updatedDriver = await prisma.driver.update({
		where: {
			id: driverId,
		},
		data: {
			ambulanceId: ambulanceId,
		},
	});

	return updatedDriver;
};

const createDriver = async (payload: IDriverPayload) => {
	const { name, email, phone, licenseNumber, ambulanceId } = payload;

	const existingDriver = await prisma.driver.findFirst({
		where: {
			OR: [{ email }, { phone }, { licenseNumber }],
			deletedAt: null,
		},
	});

	if (existingDriver) {
		if (existingDriver.email === email) {
			throw new AppError(409, "Driver with this email already exists");
		}
		if (existingDriver.phone === phone) {
			throw new AppError(409, "Driver with this phone number already exists");
		}

		if (existingDriver.licenseNumber === licenseNumber) {
			throw new AppError(409, "Driver with this license number already exists");
		}
	}

	if (ambulanceId) {
		const ambulance = await prisma.ambulance.findUnique({
			where: {
				id: ambulanceId,
				deletedAt: null,
			},
			include: {
				drivers: true,
			},
		});

		if (!ambulance) {
			throw new AppError(404, "Ambulance not found");
		}

		if (ambulance.status !== AmbulanceStatus.AVAILABLE) {
			throw new AppError(404, "Ambulance is not available for assignment");
		}

		if (ambulance.drivers && ambulance.drivers.deletedAt === null) {
			throw new AppError(
				409,
				"Ambulance is already assigned to another driver",
			);
		}
	}

	const driver = await prisma.driver.create({
		data: {
			name,
			email,
			phone,
			licenseNumber,
			ambulanceId: ambulanceId,
		},
		include: {
			ambulance: true,
		},
	});

	return driver;
};

const getAllDrivers = async () => {
	const drivers = await prisma.driver.findMany({
		where: {
			deletedAt: null,
		},
		include: {
			ambulance: true,
		},
	});

	return drivers;
};

const getDriverById = async (driverId: string) => {
	const driver = await prisma.driver.findUnique({
		where: {
			id: driverId,
			deletedAt: null,
		},
		include: {
			ambulance: true,
		},
	});

	if (!driver) {
		throw new AppError(404, "Driver not found");
	}

	return driver;
};

const updateDriver = async (
	driverId: string,
	payload: IDriverUpdatePayload,
) => {
	const { name, email, phone, ambulanceId } = payload;

	const existingDriver = await prisma.driver.findUnique({
		where: {
			id: driverId,
			deletedAt: null,
		},
	});

	if (!existingDriver) {
		throw new AppError(404, "Driver not found");
	}

	if (ambulanceId) {
		const ambulance = await prisma.ambulance.findUnique({
			where: {
				id: ambulanceId,
				deletedAt: null,
			},
			include: {
				drivers: true,
			},
		});

		if (!ambulance) {
			throw new AppError(404, "Ambulance not found");
		}

		if (ambulance.status !== AmbulanceStatus.AVAILABLE) {
			throw new AppError(404, "Ambulance is not available for assignment");
		}

		if (ambulance.drivers && ambulance.drivers.deletedAt === null) {
			throw new AppError(
				409,
				"Ambulance is already assigned to another driver",
			);
		}
	}

	const updatedDriver = await prisma.driver.update({
		where: {
			id: driverId,
		},
		data: {
			name,
			email,
			phone,
			ambulanceId,
		},
		include: {
			ambulance: true,
		},
	});

	return updatedDriver;
};

const deleteDriver = async (driverId: string) => {
	const existingDriver = await prisma.driver.findUnique({
		where: {
			id: driverId,
			deletedAt: null,
		},
	});

	if (!existingDriver) {
		throw new AppError(404, "Driver not found");
	}

	const deletedDriver = await prisma.driver.delete({
		where: {
			id: driverId,
		},
	});
	return deletedDriver;
};

export const driverService = {
	assignAmbulanceToDriver,
	createDriver,
	getAllDrivers,
	getDriverById,
	updateDriver,
	deleteDriver,
};
