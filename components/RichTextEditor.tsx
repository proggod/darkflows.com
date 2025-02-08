'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import { common, createLowlight } from 'lowlight'
import { useEffect, useState, useCallback } from 'react';
import { 
  Bold, Italic, List, ImageIcon, 
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
  const [_uploading, setUploading] = useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'no-spacing',
          },
        },
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
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-invert min-h-[200px] max-w-none w-full p-4 focus:outline-none [&_.no-spacing]:m-0 [&_.no-spacing]:p-0',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const { url } = await response.json();
        editor?.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload image');
      } finally {
        setUploading(false);
      }
    };

    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    const url = window.prompt('Enter the URL:');
    if (url) {
      editor?.chain().focus().toggleLink({ href: url }).run();
    }
  }, [editor]);

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
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded ${editor?.isActive('heading', { level: 1 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor?.isActive('heading', { level: 2 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          title="Heading 3"
        >
          H3
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
          onClick={setLink}
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