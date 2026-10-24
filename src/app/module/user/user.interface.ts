import type { Role, UserStatus } from "../../../generated/prisma/enums";

export interface IUserUpdatePayload {
	name?: string;
	phone?: string;
}

export interface IUserStatusUpdatePayload {
	status:UserStatus
}

export interface IUserRoleUpdatePayload {
	role:Role
}