import { Router } from "express";
import { ambulanceRouter } from "../module/ambulances/ambulance.route";
import { dispatchRouter } from "../module/dispatches/dispatch.route";
import { driverRouter } from "../module/drivers/driver.route";
import { emergencyRouter } from "../module/emergencies/emergency.route";
import { hospitalRouter } from "../module/hospitals/hospital.route";
import { userRouter } from "../module/user/user.route";
import { authRouter } from "./../module/auth/auth.routes";

const router = Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);
router.use("/ambulance", ambulanceRouter);
router.use("/emergency", emergencyRouter);
router.use("/dispatch", dispatchRouter);
router.use("/driver", driverRouter);
router.use("/hospital", hospitalRouter);

export const appRouter = router;
