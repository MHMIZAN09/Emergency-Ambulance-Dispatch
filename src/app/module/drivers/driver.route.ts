import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { driverController } from "./driver.controller";

const router = Router();

router.patch(
	"/:id/ambulance",
	auth(Role.ADMIN),
	driverController.assignAmbulanceToDriver,
);

router.post("/", auth(Role.ADMIN), driverController.createDriver);

router.get(
	"/",
	auth(Role.ADMIN, Role.DISPATCHER),
	driverController.getAllDrivers,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.DISPATCHER),
	driverController.getDriverById,
);

router.patch("/:id", auth(Role.ADMIN), driverController.updateDriver);

router.delete("/:id", auth(Role.ADMIN), driverController.deleteDriver);

export const driverRouter = router;
