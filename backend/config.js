import dotenv from 'dotenv';
dotenv.config();
export const config = {
    db: { URI: process.env.DB_URI },
    jwt: { secret: process.env.JWT_SECRET_KEY },
    email: {
        user: process.env.USER_EMAIL,
        password: process.env.USER_PASSWORD
    },
    app: {
        frontend_url: process.env.FRONTEND_URL,
        address_api: process.env.ADDRESS_API
    },
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
};