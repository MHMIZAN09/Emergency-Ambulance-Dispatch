import type { DispatchStatus } from "../../../generated/prisma/enums";

export interface IDispatchPayload {
	emergencyId: string;
	ambulanceId: string;
}

export interface IUpdateDispatchStatusPayload {
	status: DispatchStatus;
}

export interface ICancelDispatchPayload {
	reason?: string;
}
