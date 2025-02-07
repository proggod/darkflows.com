'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight'
import { useEffect, useState, useCallback } from 'react';
import { 
  Bold, Italic, Heading2, List, Image as ImageIcon, 
  Code, Link2, Quote
} from 'lucide-react';

// Create a new lowlight instance with common languages
const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-md bg-gray-900 p-4',
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert min-h-[200px] max-w-none w-full p-4 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await res.json();
      return data.url;
    } catch (err) {
      console.error('Image upload failed:', err);
      return null;
    }
  }, []);

  const addImage = useCallback(async () => {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const imageUrl = await handleImageUpload(file);
      if (imageUrl) {
        editor?.chain().focus().setImage({ src: imageUrl }).run();
      }
    };

    // Trigger file selection
    input.click();
  }, [editor, handleImageUpload]);

  const addLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!isMounted) {
    return (
      <div className="border border-gray-700 rounded-md bg-gray-800 min-h-[200px]">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="border border-gray-700 rounded-md bg-gray-800">
      <div className="border-b border-gray-700 p-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor?.isActive('heading') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Heading"
        >
          <Heading2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor?.isActive('bulletList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded ${editor?.isActive('codeBlock') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Code Block"
        >
          <Code size={16} />
        </button>
        <button
          type="button"
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-700"
          title="Add Image"
        >
          <ImageIcon size={16} />
        </button>
        <button
          type="button"
          onClick={addLink}
          className={`p-2 rounded ${editor?.isActive('link') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Add Link"
        >
          <Link2 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded ${editor?.isActive('blockquote') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
} 