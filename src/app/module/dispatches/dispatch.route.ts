import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { dispatchController } from "./dispatch.controller";
import { DispatchValidation } from "./dispatch.validation";

const router = Router();

router.patch(
	"/:id/status",
	auth(Role.ADMIN, Role.DISPATCHER),
	validateRequest(DispatchValidation.updateDispatchStatusSchema),
	dispatchController.updateDispatchStatus,
);

router.patch(
	"/:id/cancel",
	auth(Role.ADMIN, Role.DISPATCHER),
	validateRequest(DispatchValidation.cancelDispatchSchema),
	dispatchController.cancelDispatch,
);

router.post(
	"/",
	auth(Role.ADMIN, Role.DISPATCHER),
	validateRequest(DispatchValidation.createDispatchSchema),
	dispatchController.createDispatch,
);

router.get(
	"/",
	auth(Role.ADMIN, Role.DISPATCHER),
	dispatchController.getAllDispatches,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.DISPATCHER),
	dispatchController.getDispatchById,
);

export const dispatchRouter = router;
