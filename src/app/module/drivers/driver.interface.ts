export interface IDriverPayload {
	name: string;
	email: string;
	phone: string;
	licenseNumber: string;
	ambulanceId?: string;
}

export interface IDriverUpdatePayload {
	name?: string;
	email?: string;
	phone?: string;
	ambulanceId?: string;
}

export interface IDriverAmbulancePayload {
	ambulanceId: string;
}
