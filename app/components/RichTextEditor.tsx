'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import { common, createLowlight } from 'lowlight';
import { useEffect, useState, useCallback } from 'react';
import { Bold, Italic, List, ImageIcon, Code, Link2, Quote } from 'lucide-react';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import html from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import shell from 'highlight.js/lib/languages/shell';
import plaintext from 'highlight.js/lib/languages/plaintext';
import 'highlight.js/styles/github-dark.css';

const lowlight = createLowlight(common);
lowlight.register('typescript', typescript);
lowlight.register('javascript', javascript);
lowlight.register('python', python);
lowlight.register('ruby', ruby);
lowlight.register('go', go);
lowlight.register('rust', rust);
lowlight.register('java', java);
lowlight.register('bash', bash);
lowlight.register('json', json);
lowlight.register('html', html);
lowlight.register('css', css);
lowlight.register('c', c);
lowlight.register('cpp', cpp);
lowlight.register('shell', shell);
lowlight.register('plaintext', plaintext);

const _SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'ruby',
  'go',
  'rust',
  'java',
  'c',
  'cpp',
  'bash',
  'json',
  'html',
  'css',
  'plaintext',
  'shell'
] as const;

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
          onError: (e: Event) => {
            const img = e.target as HTMLImageElement;
            console.error('Image failed to load:', {
              src: img.src,
              currentPath: window.location.pathname,
              isEditing: editor?.isEditable,
              time: new Date().toISOString()
            });
            img.style.border = '2px solid red';
            img.style.padding = '1rem';
          }
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: null,
        HTMLAttributes: {
          class: 'hljs not-prose bg-[#0d1117] rounded-lg p-4 overflow-x-auto text-xs leading-relaxed',
          spellcheck: 'false',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 hover:text-blue-300 underline',
          rel: 'noopener noreferrer',
          target: '_blank'
        },
        validate: href => /^https?:\/\//.test(href),
      }),
    ],
    content: isMounted ? (() => {
      if (!content) {
        return {
          type: 'doc',
          content: [{ type: 'paragraph' }]
        };
      }
      return content;
    })() : null,
    editorProps: {
      attributes: {
        class: 'prose prose-invert min-h-[200px] max-w-none w-full p-4 focus:outline-none [&_.no-spacing]:m-0 [&_.no-spacing]:p-0',
      },
      handlePaste: (view, event, slice) => {
        console.log('Paste event:', {
          slice,
          content: slice.content.toJSON(),
          text: event.clipboardData?.getData('text/plain')
        });
        return false; // Let TipTap handle it normally for now
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      // Only stringify if it's not already a string
      onChange(typeof json === 'string' ? json : JSON.stringify(json));
    },
    immediatelyRender: false
  });

  // Update content when it changes externally
  useEffect(() => {
    if (editor && content) {
      try {
        const parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
        if (JSON.stringify(editor.getJSON()) !== JSON.stringify(parsedContent)) {
          editor.commands.setContent(parsedContent);
        }
      } catch (e) {
        console.error('Failed to parse content:', e);
      }
    }
  }, [editor, content]);

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
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);

    // Cancel button or empty URL
    if (url === null) {
      return;
    }

    // Remove link if URL is empty
    if (url === '') {
      editor?.chain().focus().unsetLink().run();
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      alert('Please enter a valid URL (including http:// or https://)');
      return;
    }

    // Update or add link
    editor?.chain().focus().setLink({ 
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
    }).run();
  }, [editor]);

  // Add this helper function to check if text is selected
  const hasTextSelection = useCallback(() => {
    return editor?.state.selection.content().size > 0;
  }, [editor]);

  if (!isMounted || !editor) {
    return (
      <div className="border border-gray-700 rounded-md bg-gray-800 min-h-[200px]">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border border-gray-700 rounded-md bg-gray-800">
        <div className="fixed top-12 left-0 right-0 z-50 border-b border-gray-700 bg-[#111111]/95 backdrop-blur supports-[backdrop-filter]:bg-[#111111]/60">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-2 h-8">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1 rounded ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Bold"
              >
                <Bold size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1 rounded ${editor.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Italic"
              >
                <Italic size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Heading 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Heading 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`p-1 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Heading 3"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1 rounded ${editor.isActive('bulletList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Bullet List"
              >
                <List size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-1 rounded ${editor.isActive('codeBlock') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Code Block"
              >
                <Code size={14} />
              </button>
              <button
                type="button"
                onClick={addImage}
                className="p-1 rounded hover:bg-gray-700 relative"
                title="Add Image"
                disabled={uploading}
              >
                <ImageIcon size={14} className={uploading ? 'opacity-50' : ''} />
                {uploading && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 px-2 py-1 rounded text-xs whitespace-nowrap">
                    Uploading...
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={setLink}
                disabled={!hasTextSelection()}
                className={`p-1 rounded ${
                  editor?.isActive('link') 
                    ? 'bg-gray-700' 
                    : hasTextSelection() 
                      ? 'hover:bg-gray-700' 
                      : 'opacity-50 cursor-not-allowed'
                }`}
                title={hasTextSelection() ? 'Add Link' : 'Select text to add link'}
              >
                <Link2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1 rounded ${editor.isActive('blockquote') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                title="Quote"
              >
                <Quote size={14} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

function detectLanguage(code: string): typeof _SUPPORTED_LANGUAGES[number] {
  // Trim the code to remove whitespace
  const trimmedCode = code.trim();
  
  // Check for URLs, file paths, or simple commands
  if (trimmedCode.startsWith('http') || 
      trimmedCode.startsWith('/') || 
      trimmedCode.startsWith('@') ||
      !trimmedCode.includes('\n')) {
    return 'shell';
  }
  
  // Your existing language detection logic
  if (code.includes('#include') && code.includes('class ') || code.includes('std::')) return 'cpp';
  if (code.includes('#include') || code.includes('int main(')) return 'c';
  if (code.includes('def ') || code.includes('import ') && code.includes(':')) return 'python';
  if (code.includes('func ') && code.includes('package ')) return 'go';
  if (code.includes('fn ') && code.includes('let mut ')) return 'rust';
  if (code.includes('class ') && code.includes('end')) return 'ruby';
  if (code.includes('public class ')) return 'java';
  if (code.includes('function') || code.includes('=>')) return 'javascript';
  if (code.includes('<html') || code.includes('</')) return 'html';
  if (code.includes('{') && code.includes(':')) return 'json';
  if (code.includes('.class') || code.includes('#id')) return 'css';
  if (code.includes('#!/') || code.includes('$ ')) return 'bash';
  
  // If no specific language is detected, use shell for single-line commands
  // or plaintext for multi-line text
  return code.includes('\n') ? 'plaintext' : 'shell';
}