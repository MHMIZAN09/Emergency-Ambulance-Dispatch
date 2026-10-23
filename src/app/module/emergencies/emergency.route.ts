import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { emergencyController } from "./emergency.controller";

const router = Router();

router.post("/", auth(Role.REQUESTER), emergencyController.createEmergency);

router.get("/my", auth(Role.REQUESTER), emergencyController.getMyEmergencies);

router.get(
	"/all",
	auth(Role.ADMIN, Role.DISPATCHER),
	emergencyController.getAllEmergencies,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.DISPATCHER, Role.REQUESTER),
	emergencyController.getEmergencyById,
);

router.patch("/:id", auth(Role.REQUESTER), emergencyController.updateEmergency);

router.patch(
	"/:id/cancel",
	auth(Role.REQUESTER, Role.ADMIN, Role.DISPATCHER),
	emergencyController.cancelEmergency,
);

router.patch(
	"/:id/verify",
	auth(Role.ADMIN, Role.DISPATCHER),
	emergencyController.verifyEmergency,
);

router.patch(
	"/:id/hospital",
	auth(Role.DISPATCHER, Role.ADMIN),
	emergencyController.assignHospital,
);

export const emergencyRouter = router;
