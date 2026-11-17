import z from "zod";

const createPaymentSchema = z.object({
	emergencyId: z.uuid("Emergency ID must be a valid UUID"),
	amount: z.number().positive("Amount must be greater than zero"),
	currency: z.string().trim().length(3).default("BDT"),
	gateway: z.enum(["SSLCOMMERZ", "BKASH", "STRIPE"]),
});

const updatePaymentStatusSchema = z.object({
	status: z.enum(["PAID", "FAILED", "CANCELLED"]),
	gatewayTransactionId: z.string().trim().min(1).max(255).optional(),
	gatewayValidationId: z.string().trim().min(1).max(255).optional(),
});

export const PaymentValidation = {
	createPaymentSchema,
	updatePaymentStatusSchema,
};
