import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { ambulanceController } from "./ambulance.controller";

const router = Router();

router.get(
	"/available",
	auth(Role.ADMIN, Role.DISPATCHER),
	ambulanceController.getAvailableAmbulances,
);

router.patch(
	"/:id/status",
	auth(Role.ADMIN, Role.DISPATCHER),
	ambulanceController.updateAmbulanceStatus,
);

router.patch(
	"/:id/location",
	auth(Role.ADMIN, Role.DISPATCHER),
	ambulanceController.updateAmbulanceLocation,
);

router.post("/", auth(Role.ADMIN), ambulanceController.createAmbulance);

router.get(
	"/",
	auth(Role.ADMIN, Role.DISPATCHER),
	ambulanceController.getAllAmbulances,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.DISPATCHER),
	ambulanceController.getAmbulanceById,
);
router.patch("/:id", auth(Role.ADMIN), ambulanceController.updateAmbulance);
router.delete("/:id", auth(Role.ADMIN), ambulanceController.deleteAmbulance);

export const ambulanceRoute = router;
