import mongoose from 'mongoose';

export interface IPost {
  title: string;
  content: string;
  description: string;
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  coverImage?: string;
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PostSchema = new mongoose.Schema<IPost>({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [400, 'Description cannot be more than 400 characters']
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  coverImage: {
    type: String,
    required: false
  },
  readingTime: {
    type: Number,
    required: true
  },
}, {
  timestamps: true
});

// Make sure model is registered only once
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
export default Post; 