import mongoose from 'mongoose';
import { UserSchema } from '../../models/User';
import { PostSchema } from '../../models/Post';
import { CategorySchema } from '../../models/Category';

// Register all models
export function registerModels() {
    // Only register if they haven't been registered yet
    if (!mongoose.models.User) {
        mongoose.model('User', UserSchema);
    }
    
    if (!mongoose.models.Post) {
        mongoose.model('Post', PostSchema);
    }
    
    if (!mongoose.models.Category) {
        mongoose.model('Category', CategorySchema);
    }
} 

// Add this function to ensure models are registered and connected
export async function initDatabase() {
    try {
        console.log('Database initialization:', {
            timestamp: new Date().toISOString(),
            mongoUri: process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':***@'),
            connectionState: mongoose.connection.readyState
        });

        registerModels();
        
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI as string);
            console.log('Database connected:', {
                timestamp: new Date().toISOString(),
                newState: mongoose.connection.readyState,
                models: Object.keys(mongoose.models)
            });
        }
    } catch (error) {
        console.error('Database connection error:', {
            timestamp: new Date().toISOString(),
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
    }
} 