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