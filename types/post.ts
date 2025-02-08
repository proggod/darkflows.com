export interface PostDocument {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  } | null;
  category: {
    _id: string;
    name: string;
    slug: string;
  } | null;
  coverImage?: string;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
} 