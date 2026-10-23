import { Router } from "express";
import { userRouter } from "../module/user/user.route";
import { authRouter } from "./../module/auth/auth.routes";

const router = Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);

export const appRouter = router;
