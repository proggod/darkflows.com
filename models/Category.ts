import mongoose from 'mongoose';

export interface ICategory {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
}, {
  timestamps: true
});

// Add pre-save hook to generate slug if not provided
CategorySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category; 