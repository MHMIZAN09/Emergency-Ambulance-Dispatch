import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { hospitalController } from "./hospital.controller";

const router = Router();

router.post("/", auth(Role.ADMIN), hospitalController.createHospital);

router.get("/", hospitalController.getAllHospitals);

router.get(
	"/nearby",
	auth(Role.ADMIN, Role.DISPATCHER),
	hospitalController.getNearbyHospitals,
);
router.get("/:id", hospitalController.getHospitalById);

router.patch("/:id", auth(Role.ADMIN), hospitalController.updateHospital);

router.delete("/:id", auth(Role.ADMIN), hospitalController.deleteHospital);

export const hospitalRouter = router;
