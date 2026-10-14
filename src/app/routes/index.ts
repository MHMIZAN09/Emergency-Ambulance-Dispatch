import { Router } from "express";
import { authRouter } from "./../module/auth/auth.routes";

const router = Router();
router.use("/auth", authRouter);

export const appRouter = router;
