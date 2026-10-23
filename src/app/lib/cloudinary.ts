import { v2 as Cloudinary } from "cloudinary";


Cloudinary.config({
	cloud_name: "name",
	api_key: "key",
	api_secret: "secret",
});

export const cloudinary = Cloudinary;