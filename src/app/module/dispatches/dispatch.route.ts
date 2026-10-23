import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { dispatchController } from "./dispatch.controller";

const router = Router();

router.patch(
	"/:id/status",
	auth(Role.ADMIN, Role.DISPATCHER),
	dispatchController.updateDispatchStatus,
);

router.patch(
	"/:id/cancel",
	auth(Role.ADMIN, Role.DISPATCHER),
	dispatchController.cancelDispatch,
);

router.post(
	"/",
	auth(Role.ADMIN, Role.DISPATCHER),
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
