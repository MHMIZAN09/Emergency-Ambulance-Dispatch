import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import httpStatus from "http-status";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notFound } from "./app/middleware/notFound";
import { appRouter } from "./app/routes";

const app: Application = express();

app.use(
	cors({
		origin: "*", // Allow requests from any origin
		credentials: true, // Allow credentials (cookies, authorization headers, etc.)
		// methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Allowed HTTP methods
	}),
);

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Basic route
app.get("/", async (req: Request, res: Response) => {
	res.status(httpStatus.OK).json({
		success: true,
		message: "Welcome to Emergenc Ambulance Dispatch System API",
	});
});

app.use("/api/v1", appRouter);

app.use(globalErrorHandler);
app.use(notFound);

export default app;
