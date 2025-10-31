
import { log } from '../shared/logs/logger'
import mongoose from 'mongoose';
import { config } from './env.config';

const mongoURI = config.mongoUri || '';

export const db_connection = async () => {
    try {
        await mongoose.connect(mongoURI);
        log.info('💽 Connected to MongoDB successfully');
    } catch (error) {
        log.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};