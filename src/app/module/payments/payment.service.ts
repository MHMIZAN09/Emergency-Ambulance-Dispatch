import { PaymentGateway, PaymentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type { IQueryParams } from "../../types/query.types";
import { PrismaQueryBuilder } from "../../utils/query-builder";
import type {
	ICreatePaymentPayload,
	IUpdatePaymentStatusPayload,
} from "./payment.interface";

const paymentInclude = {
	emergency: {
		select: {
			id: true,
			patientName: true,
			status: true,
			userId: true,
		},
	},
} as const;

const createPayment = async (
	userId: string,
	payload: ICreatePaymentPayload,
) => {
	const emergency = await prisma.emergencyRequest.findFirst({
		where: {
			id: payload.emergencyId,
			userId,
			status: "COMPLETED",
			deletedAt: null,
		},
		select: { id: true },
	});

	if (!emergency) {
		throw new AppError(
			409,
			"Payment can only be created for your completed emergency",
		);
	}

	const existingPayment = await prisma.payment.findFirst({
		where: {
			emergencyId: emergency.id,
			status: { in: [PaymentStatus.UNPAID, PaymentStatus.PAID] },
		},
		include: paymentInclude,
	});

	if (existingPayment) {
		return existingPayment;
	}

	return prisma.payment.create({
		data: {
			emergencyId: emergency.id,
			amount: payload.amount,
			currency: payload.currency ?? "BDT",
			gateway: payload.gateway,
			merchantInvoiceNumber: `EAD-${Date.now()}-${Math.random()
				.toString(36)
				.slice(2, 8)
				.toUpperCase()}`,
		},
		include: paymentInclude,
	});
};

const getAllPayments = async (userId: string, query: IQueryParams) => {
	return new PrismaQueryBuilder(query, {
		searchableFields: ["merchantInvoiceNumber", "currency", "gateway"],
		filterableFields: ["status", "gateway", "currency"],
		sortableFields: ["createdAt", "updatedAt", "amount", "status"],
	})
		.search()
		.filter()
		.sort()
		.paginate()
		.execute(prisma.payment, {
			where: { emergency: { userId, deletedAt: null } },
			include: paymentInclude,
		});
};

const getPaymentById = async (userId: string, paymentId: string) => {
	const payment = await prisma.payment.findFirst({
		where: {
			id: paymentId,
			emergency: { userId, deletedAt: null },
		},
		include: paymentInclude,
	});

	if (!payment) {
		throw new AppError(404, "Payment not found");
	}

	return payment;
};

const updatePaymentStatus = async (
	paymentId: string,
	payload: IUpdatePaymentStatusPayload,
) => {
	const payment = await prisma.payment.findUnique({
		where: { id: paymentId },
		select: { id: true, status: true },
	});

	if (!payment) {
		throw new AppError(404, "Payment not found");
	}

	if (payment.status === PaymentStatus.PAID) {
		throw new AppError(409, "A paid payment cannot be changed");
	}

	const now = new Date();
	const data = {
		status: payload.status,
		...(payload.status === PaymentStatus.PAID
			? { paidAt: now, failedAt: null, cancelledAt: null }
			: {}),
		...(payload.status === PaymentStatus.FAILED ? { failedAt: now } : {}),
		...(payload.status === PaymentStatus.CANCELLED ? { cancelledAt: now } : {}),
		...(payload.gatewayTransactionId
			? { gatewayTransactionId: payload.gatewayTransactionId }
			: {}),
		...(payload.gatewayValidationId
			? { gatewayValidationId: payload.gatewayValidationId }
			: {}),
	};

	return prisma.payment.update({
		where: { id: payment.id },
		data,
		include: paymentInclude,
	});
};

export const paymentService = {
	createPayment,
	getAllPayments,
	getPaymentById,
	updatePaymentStatus,
};

export { PaymentGateway };
