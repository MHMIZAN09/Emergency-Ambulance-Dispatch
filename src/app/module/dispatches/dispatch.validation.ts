import z from "zod";

const createDispatchSchema = z.object({
	emergencyId: z.uuid("Emergency ID must be a valid UUID"),
	ambulanceId: z.uuid("Ambulance ID must be a valid UUID"),
});

const updateDispatchStatusSchema = z.object({
	status: z.enum([
		"ASSIGNED",
		"EN_ROUTE",
		"PICKED_UP",
		"AT_HOSPITAL",
		"COMPLETED",
	]),
});

const cancelDispatchSchema = z.object({
	reason: z.string().trim().min(1).max(500).optional(),
});

export const DispatchValidation = {
	createDispatchSchema,
	updateDispatchStatusSchema,
	cancelDispatchSchema,
};
