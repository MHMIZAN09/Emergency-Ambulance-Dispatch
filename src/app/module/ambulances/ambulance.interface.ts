// model Ambulance {
//     id           String          @id @default(uuid())
//     licensePlate String          @unique
//     model        String
//     manufacturer String?
//     year         Int?
//     type         AmbulanceType
//     capacity     Int
//     status       AmbulanceStatus @default(OFFLINE)

//     latitude  Float?
//     longitude Float?

//     baseFare  Decimal @db.Decimal(10, 2)
//     perKmFare Decimal @db.Decimal(10, 2)

//     lastLocationAt DateTime?
//     deletedAt      DateTime?
//     createdAt      DateTime  @default(now())
//     updatedAt      DateTime  @updatedAt

//     drivers    Driver?
//     dispatches Dispatch[]

//     @@index([status, deletedAt])
//     @@index([type, status])
//     @@map("ambulances")
// }

export interface IAmbulancePayload {
	licensePlate: string;
	model: string;
	manufacturer?: string;
	year?: number;
	type: string;
	capacity: number;
	status: string;
	latitude?: number;
	longitude?: number;
	baseFare: string;
	perKmFare: string;
}

export interface IAmbulanceStatusPayload {
	status: string;
}

export interface IAmbulanceLocationPayload {
	latitude: number;
	longitude: number;
}

export interface IAmbulanceUpdatePayload {
	licensePlate?: string;
	model?: string;
	manufacturer?: string;
	year?: number;
	type?: string;
	capacity?: number;
	status?: string;
	latitude?: number;
	longitude?: number;
	baseFare?: string;
	perKmFare?: string;
}
