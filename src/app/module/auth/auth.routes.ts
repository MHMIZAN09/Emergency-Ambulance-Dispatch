import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./auth.validation";

const router = Router();

router.post(
	"/register",
	validateRequest(UserValidation.RegistrationZodSchema),
	AuthController.registerUser,
);

router.post(
	"/login",
	validateRequest(UserValidation.LoginZodSchema),
	AuthController.loginUser,
);

router.get(
	"/me",
	auth(Role.ADMIN, Role.DISPATCHER, Role.REQUESTER),
	AuthController.getMe,
);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/logout", AuthController.logout);

export const authRouter = router;
