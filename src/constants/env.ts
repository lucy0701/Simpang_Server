import dotenv from 'dotenv';

dotenv.config();

export const BE_URL = process.env.NEXT_PUBLIC_BE_URL as string;
export const PORT = process.env.PORT as string;
export const MONGODB_URI = process.env.MONGODB_URI as string;

export const IMAGE_BB_API_KEY = process.env.IMAGE_BB_API_KEY as string;
