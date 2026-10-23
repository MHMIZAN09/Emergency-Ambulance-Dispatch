import type {
	BloodGroup,
	EmergencyPriority,
} from "../../../generated/prisma/enums";

export interface IEmergencyPayload {
	patientName: string;
	patientAge?: number;
	bloodGroup?: BloodGroup;
	description: string;
	priority?: EmergencyPriority;
	pickupAddress: string;
	pickupLat: number;
	pickupLng: number;
}

export interface IEmergencyUpdatePayload {
	patientName?: string;
	patientAge?: number;
	bloodGroup?: BloodGroup;
	description?: string;
	priority?: EmergencyPriority;
	pickupAddress?: string;
	pickupLat?: number;
	pickupLng?: number;
}

export interface IAssignHospitalPayload {
	hospitalId: string;
}
