import dotenv from 'dotenv';

dotenv.config();

export const BE_URL = process.env.BE_URL as string;
export const FE_URL = process.env.FE_URL as string;
export const PORT = parseInt(process.env.PORT as string);
export const MONGODB_URI = process.env.MONGODB_URI as string;

export const IMAGE_BB_API_KEY = process.env.IMAGE_BB_API_KEY as string;

export const REST_API_KEY = process.env.REST_API_KEY as string;
export const KAKAO_APP_KEY = process.env.KAKAO_APP_KEY as string;

export const SECRET_KEY = process.env.SECRET_KEY as string;
