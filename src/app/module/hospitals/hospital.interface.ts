import type { HospitalStatus } from "../../../generated/prisma/enums";

export interface IHospitalPayload {
	name: string;
	address: string;
	phone: string;
	email: string;
	latitude?: number;
	longitude?: number;
	status?: HospitalStatus;
}

export interface IHospitalUpdatePayload {
	name?: string;
	address?: string;
	phone?: string;
	email?: string;
	latitude?: number;
	longitude?: number;
	status?: HospitalStatus;
}
