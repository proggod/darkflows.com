'use client';

import { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface BlogEditorProps {
  initialData?: {
    title: string;
    content: string;
    category: string;
    coverImage?: string;
  };
  postId?: string;
}

interface EditorChangeEvent {
  target: {
    value: string;
  };
}

interface TinyMCEEditor {
  getContent: () => string;
}

export default function BlogEditor({ initialData, postId }: BlogEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'Other');
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const editorRef = useRef<TinyMCEEditor | null>(null);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const content = editorRef.current?.getContent();

      if (!title || !content || !category) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await fetch(postId ? `/api/posts/${postId}` : '/api/posts', {
        method: postId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          category,
          coverImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save post');
      }

      router.push('/blog');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <input
        type="text"
        value={title}
        onChange={(e: EditorChangeEvent) => setTitle(e.target.value)}
        placeholder="Post Title"
        className="w-full px-4 py-2 text-2xl font-bold bg-transparent border-b border-gray-700 focus:outline-none focus:border-gray-500"
      />

      <div className="flex gap-4">
        <select
          value={category}
          onChange={(e: EditorChangeEvent) => setCategory(e.target.value)}
          className="px-4 py-2 bg-gray-800 rounded-md"
        >
          <option value="Tutorial">Tutorial</option>
          <option value="News">News</option>
          <option value="Release">Release</option>
          <option value="Guide">Guide</option>
          <option value="Other">Other</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) {
              try {
                const url = await handleImageUpload(file);
                setCoverImage(url);
              } catch (error) {
                console.error('Cover image upload failed:', error);
                alert('Failed to upload cover image');
              }
            }
          }}
          className="hidden"
          id="cover-image"
        />
        <label
          htmlFor="cover-image"
          className="px-4 py-2 bg-gray-800 rounded-md cursor-pointer hover:bg-gray-700"
        >
          {coverImage ? 'Change Cover Image' : 'Add Cover Image'}
        </label>
      </div>

      {coverImage && (
        <div className="relative w-full h-48">
          <Image
            src={coverImage}
            alt="Cover"
            fill
            className="object-cover rounded-lg"
          />
          <button
            onClick={() => setCoverImage('')}
            className="absolute top-2 right-2 p-1 bg-red-600 rounded-full"
          >
            ×
          </button>
        </div>
      )}

      <Editor
        onInit={(evt, editor) => editorRef.current = editor}
        initialValue={initialData?.content}
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          images_upload_handler: async (blobInfo) => {
            try {
              const url = await handleImageUpload(blobInfo.blob() as File);
              return url;
            } catch (error) {
              console.error('Image upload failed:', error);
              throw error;
            }
          }
        }}
      />

      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-700 rounded-md hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Publish'}
        </button>
      </div>
    </div>
  );
} 