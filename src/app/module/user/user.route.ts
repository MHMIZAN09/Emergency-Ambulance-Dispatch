/** biome-ignore-all assist/source/organizeImports: <explanation> */
import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";

import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = Router();

router.patch(
	"/update/:id",
	auth(Role.ADMIN, Role.REQUESTER, Role.DISPATCHER),
	validateRequest(UserValidation.updateUserSchema),
	UserController.updateUser,
);

router.get("/admin/all", auth(Role.ADMIN), UserController.getAllUsers);

export const userRouter = router;
