import { Router } from "express";
import { authRouter } from "./../module/auth/auth.routes";
import { userRouter } from "../module/user/user.route";

const router = Router();
router.use("/auth", authRouter);
router.use("/user", userRouter);

export const appRouter = router;
