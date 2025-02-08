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

const SUPPORTED_LANGUAGES = [
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
  'css'
] as const;

type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [_uploading, setUploading] = useState(false);
  const [debugContent, setDebugContent] = useState('');
  const [debugHtml, setDebugHtml] = useState('');
  
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
      }),
    ],
    content: isMounted ? content : '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert min-h-[200px] max-w-none w-full p-4 focus:outline-none [&_.no-spacing]:m-0 [&_.no-spacing]:p-0',
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        if (text) {
          // If we're already in a code block, just insert the text
          if (view.state.selection.$head.parent.type.name === 'codeBlock') {
            view.dispatch(view.state.tr.insertText(text));
            return true;
          }

          const cleanedText = text.trim();
          const looksLikeCode = cleanedText.includes('\n') || /[{}()<>]/.test(cleanedText);
          
          if (looksLikeCode) {
            const tr = view.state.tr;
            
            // Find the blockquote node if it exists
            const $pos = view.state.selection.$head;
            const blockquote = $pos.node(-1)?.type.name === 'blockquote' 
              ? $pos.node(-1) 
              : null;
            
            // Create a new code block
            const codeBlock = view.state.schema.nodes.codeBlock.create(
              { 
                language: detectLanguage(cleanedText) || 'typescript' 
              },
              [view.state.schema.text(cleanedText)]
            );

            if (blockquote) {
              // If we're in a blockquote, replace the entire blockquote
              const blockquotePos = $pos.before(-1);
              tr.replaceWith(blockquotePos, blockquotePos + blockquote.nodeSize, codeBlock);
            } else {
              // Otherwise insert at current position
              const pos = view.state.selection.$head.pos;
              tr.replaceWith(pos, pos, codeBlock);
            }

            view.dispatch(tr);
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Convert to JSON and stringify before saving
      const json = editor.getJSON();
      onChange(JSON.stringify(json));
      
      // For debugging only
      setDebugHtml(editor.getHTML());
      setDebugContent(JSON.stringify(json, null, 2));
    },
  });

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
    const url = window.prompt('Enter URL');
    if (url && editor) {
      editor.chain().focus().toggleLink({ href: url }).run();
    }
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
        <div className="border-b border-gray-700 p-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded ${editor.isActive('bold') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded ${editor.isActive('italic') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Bullet List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
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
            className={`p-2 rounded ${editor.isActive('link') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Add Link"
          >
            <Link2 size={16} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Quote"
          >
            <Quote size={16} />
          </button>
        </div>
        <EditorContent editor={editor} />
      </div>

      <div className="space-y-4 text-sm">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <div>isMounted: {String(isMounted)}</div>
          <div>Editor Active: {String(!!editor)}</div>
          <div>Can Edit: {String(editor?.isEditable)}</div>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">Current HTML:</h3>
          <pre className="whitespace-pre-wrap break-all">{debugHtml}</pre>
        </div>

        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="font-bold mb-2">Editor JSON:</h3>
          <pre className="whitespace-pre-wrap">{debugContent}</pre>
        </div>
      </div>
    </div>
  );
}

function detectLanguage(code: string): SupportedLanguage | null {
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
  return 'typescript'; // default
}