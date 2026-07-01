import mongoose from 'mongoose';
import { config } from './config.js';
import model from './src/models/client.js';
const seed = async () => {
    try {
        await mongoose.connect(config.db.URI);
        const exists = await model.findOne({ email: 'admin@orve.com' });
        if (exists) {
            console.log('admin already exists');
            process.exit(0);
        }
        const admin = await model.create({
            name: 'Paolo Alberto',
            lastname: 'prueba',
            email: 'client@orve.com',
            password: 'Client1234!',
            verified_email: true,
            verified_phone_number: true,
            document: {
                type: 'dui',
                number: '00000000-0'
            },
            phone: {
                country_code: '+503',
                number: '0000-0000'
            },
            picture: 'https://placehold.co/600x600/png',
            picture_id: 'seed-admin-placeholder'
        });
        console.log('admin created successfully');
        console.log(admin);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};
seed();