import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";

const router = Router();

router.post("/", auth(Role.ADMIN), ambulanceController.createAmbulance);

router.get(
	"/",
	auth(Role.ADMIN, Role.DISPATCHER),
	ambulanceController.getAllAmbulances,
);

router.get(
	"/available",
	auth(Role.ADMIN, Role.DISPATCHER),
	ambulanceController.getAvailableAmbulances,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.DISPATCHER),
	ambulanceController.getAmbulanceById,
);

router.patch("/:id", auth(Role.ADMIN), ambulanceController.updateAmbulance);

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

router.delete("/:id", auth(Role.ADMIN), ambulanceController.deleteAmbulance);

export const ambulanceRoute = router;
