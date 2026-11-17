import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { paymentController } from "./payment.controller";
import { PaymentValidation } from "./payment.validation";

const router = Router();

router.post(
	"/create",
	auth(Role.REQUESTER),
	validateRequest(PaymentValidation.createPaymentSchema),
	paymentController.createPayment,
);

router.get("/", auth(Role.REQUESTER), paymentController.getAllPayments);

router.get("/:id", auth(Role.REQUESTER), paymentController.getPaymentById);

router.patch(
	"/:id/status",
	auth(Role.ADMIN),
	validateRequest(PaymentValidation.updatePaymentStatusSchema),
	paymentController.updatePaymentStatus,
);

export const paymentRoutes = router;
