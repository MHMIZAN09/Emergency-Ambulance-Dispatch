import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import type {
	ICancelDispatchPayload,
	IDispatchPayload,
	IUpdateDispatchStatusPayload,
} from "./dispatch.interface";

const createDispatch = async (
	payload: IDispatchPayload,
	assignedById: string,
) => {
	const { emergencyId, ambulanceId } = payload;

	return prisma.$transaction(async (tx) => {
		const dispatcher = await tx.user.findUnique({
			where: { id: assignedById,
				role:{
					in: ["DISPATCHER", "ADMIN"],
				},
				status: "ACTIVE",
				isDeleted: false,
				deletedAt: null,
			},
			select: {
				id: true,
			},
		});
		
		if (!dispatcher) {
			throw new AppError(403, "User is not authorized to assign dispatches");
		}

		const emergency = await tx.emergencyRequest.findUnique({
			where: { id: emergencyId, deletedAt: null },
			select: {
				id: true,
				status: true,
				hospitalId: true,
			},
		});

		if (!emergency) {
			throw new AppError(404, "Emergency request not found");
		}
		if(emergency.status !== "VERIFIED"){
			throw new AppError(400,  "Only verified emergencies can be dispatched");
		}

		if(!emergency.hospitalId){
			throw new AppError(400,  "Emergency request does not have an assigned hospital");
		}

		const ambulance = await tx.ambulance.findUnique({
			where: { id: ambulanceId, deletedAt: null },
			select: {
				id: true,
				status: true,
			},
		});

		if (!ambulance) {
			throw new AppError(404, "Ambulance not found");
		}

		if (ambulance.status !== "AVAILABLE") {
			throw new AppError(400, "Ambulance is not available for dispatch");
		}

		 const ambulanceUpdate = await tx.ambulance.updateMany({
            where: {
                id: ambulanceId,
                status: "AVAILABLE",
                deletedAt: null,
            },
            data: {
                status: "BUSY",
            },
        });

        if (ambulanceUpdate.count === 0) {
            throw new AppError(
                409,
                "Ambulance is no longer available",
            );
        }

		 const emergencyUpdate =
            await tx.emergencyRequest.updateMany({
                where: {
                    id: emergencyId,
                    status: "VERIFIED",
                    hospitalId: emergency.hospitalId,
                    deletedAt: null,
                },
                data: {
                    status: "ASSIGNED",
                },
            });

        if (emergencyUpdate.count === 0) {
            throw new AppError(
                409,
                "Emergency has already been processed",
            );
        }

		 const dispatch = await tx.dispatch.create({
            data: {
                emergencyId,
                ambulanceId,
                assignedById: dispatcher.id,
            },
            include: {
                emergency: {
                    include: {
                        hospital: true,
                    },
                },
                ambulance: true,
                assignedBy: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

		return dispatch;
		
	});
};

const getAllDispatches = async () => {
	const dispatches = await prisma.dispatch.findMany({
        include: {
            emergency: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            imageUrl: true,
                        },
                    },
                    hospital: true,
                },
            },
            ambulance: true,
            assignedBy: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
	return dispatches;
};

const getDispatchById = async (dispatchId: string) => {
	const dispatch = await prisma.dispatch.findUnique({
        where: {
            id: dispatchId,
            emergency: {
                deletedAt: null,
            },
            ambulance: {
                deletedAt: null,
            },
        },
        include: {
            emergency: {
                include: {
                    hospital: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            imageUrl: true,
                        },
                    },
                },
            },
            ambulance: true,
            assignedBy: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
    });

	if (!dispatch) {
		throw new AppError(404, "Dispatch not found");
	}
	return dispatch;
};


const updateDispatchStatus = async (
    dispatchId: string,
    payload: IUpdateDispatchStatusPayload,
) => {
    return prisma.$transaction(async (tx) => {
        const dispatch = await tx.dispatch.findUnique({
            where: { id: dispatchId },
        });

        if (!dispatch) {
            throw new AppError(404, "Dispatch not found");
        }

        const transitions: Record<string, string[]> = {
            ASSIGNED: ["EN_ROUTE"],
            EN_ROUTE: ["PICKED_UP"],
            PICKED_UP: ["AT_HOSPITAL"],
            AT_HOSPITAL: ["COMPLETED"],
        };

        const allowedNextStatuses =
            transitions[dispatch.status] ?? [];

        if (!allowedNextStatuses.includes(payload.status)) {
            throw new AppError(
                409,
                `Dispatch cannot move from ${dispatch.status} to ${payload.status}`,
            );
        }

        const now = new Date();

        const timestampByStatus: Partial<
            Record<string, Record<string, Date>>
        > = {
            EN_ROUTE: { enRouteAt: now },
            PICKED_UP: { pickedUpAt: now },
            AT_HOSPITAL: { arrivedAt: now },
            COMPLETED: { completedAt: now },
        };

        const dispatchUpdate = await tx.dispatch.updateMany({
            where: {
                id: dispatch.id,
                status: dispatch.status,
            },
            data: {
                status: payload.status,
                ...timestampByStatus[payload.status],
            },
        });

        if (dispatchUpdate.count === 0) {
            throw new AppError(
                409,
                "Dispatch status has changed. Please refresh and try again.",
            );
        }

        const emergencyUpdate =
            await tx.emergencyRequest.updateMany({
                where: {
                    id: dispatch.emergencyId,
                    status: dispatch.status,
                    deletedAt: null,
                },
                data: {
                    status: payload.status,
                    ...(payload.status === "COMPLETED"
                        ? { completedAt: now }
                        : {}),
                },
            });

        if (emergencyUpdate.count === 0) {
            throw new AppError(
                409,
                "Emergency status is inconsistent with the dispatch",
            );
        }

        if (payload.status === "COMPLETED") {
            const activeDispatch = await tx.dispatch.findFirst({
                where: {
                    ambulanceId: dispatch.ambulanceId,
                    id: { not: dispatch.id },
                    status: {
                        notIn: ["COMPLETED", "CANCELLED"],
                    },
                },
                select: { id: true },
            });

            if (!activeDispatch) {
                await tx.ambulance.updateMany({
                    where: {
                        id: dispatch.ambulanceId,
                        status: "BUSY",
                        deletedAt: null,
                    },
                    data: {
                        status: "AVAILABLE",
                    },
                });
            }
        }

        return tx.dispatch.findUniqueOrThrow({
            where: { id: dispatch.id },
            include: {
                emergency: {
                    include: { hospital: true },
                },
                ambulance: true,
            },
        });
    });
};


const cancelDispatch = async (
    dispatchId: string,
    payload: ICancelDispatchPayload,
) => {
    return prisma.$transaction(async (tx) => {
        const dispatch = await tx.dispatch.findUnique({
            where: { id: dispatchId },
        });

        if (!dispatch) {
            throw new AppError(404, "Dispatch not found");
        }

        if (
            dispatch.status === "CANCELLED" ||
            dispatch.status === "COMPLETED"
        ) {
            throw new AppError(
                409,
                `Cannot cancel a dispatch that is already ${dispatch.status.toLowerCase()}`,
            );
        }

        const emergency = await tx.emergencyRequest.findFirst({
            where: {
                id: dispatch.emergencyId,
                deletedAt: null,
            },
            select: {
                id: true,
                status: true,
            },
        });

        if (!emergency) {
            throw new AppError(404, "Emergency not found");
        }

        if (
            emergency.status === "COMPLETED" ||
            emergency.status === "CANCELLED"
        ) {
            throw new AppError(
                409,
                "The emergency is already completed or cancelled",
            );
        }

        const now = new Date();

        const dispatchUpdate = await tx.dispatch.updateMany({
            where: {
                id: dispatch.id,
                status: dispatch.status,
            },
            data: {
                status: "CANCELLED",
                cancelReason: payload.reason,
                cancelledAt: now,
            },
        });

        if (dispatchUpdate.count === 0) {
            throw new AppError(
                409,
                "Dispatch status changed. Please try again.",
            );
        }

        const emergencyUpdate =
            await tx.emergencyRequest.updateMany({
                where: {
                    id: emergency.id,
                    status: emergency.status,
                    deletedAt: null,
                },
                data: {
                    status: "CANCELLED",
                    cancelledAt: now,
                },
            });

        if (emergencyUpdate.count === 0) {
            throw new AppError(
                409,
                "Emergency status changed. Please try again.",
            );
        }

        const activeDispatch = await tx.dispatch.findFirst({
            where: {
                ambulanceId: dispatch.ambulanceId,
                id: { not: dispatch.id },
                status: {
                    notIn: ["COMPLETED", "CANCELLED"],
                },
            },
            select: { id: true },
        });

        if (!activeDispatch) {
            await tx.ambulance.updateMany({
                where: {
                    id: dispatch.ambulanceId,
                    status: "BUSY",
                    deletedAt: null,
                },
                data: {
                    status: "AVAILABLE",
                },
            });
        }

        return tx.dispatch.findUniqueOrThrow({
            where: { id: dispatch.id },
            include: {
                emergency: {
                    include: { hospital: true },
                },
                ambulance: true,
            },
        });
    });
};


export const dispatchService = {
	createDispatch,
	getAllDispatches,
	getDispatchById,
	updateDispatchStatus,
	cancelDispatch,
};
