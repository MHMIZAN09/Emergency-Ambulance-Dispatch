import type {
	PaymentGateway,
	PaymentStatus,
} from "../../../generated/prisma/enums";

export interface ICreatePaymentPayload {
	emergencyId: string;
	amount: number;
	currency?: string;
	gateway: PaymentGateway;
}

export interface IUpdatePaymentStatusPayload {
	status: Exclude<PaymentStatus, "UNPAID" | "REFUNDED">;
	gatewayTransactionId?: string;
	gatewayValidationId?: string;
}
