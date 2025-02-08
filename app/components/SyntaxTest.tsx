'use client';

import { useState, useMemo, useEffect } from 'react';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import typescript from 'highlight.js/lib/languages/typescript';
import hljs from 'highlight.js/lib/core';
import 'highlight.js/styles/github-dark.css';

const sampleCode = {
  type: "doc",
  content: [
    {
      type: "codeBlock",
      attrs: { language: "typescript" },
      content: [{ type: "text", text: `// Sample TypeScript code
function hello(name: string): string {
  return \`Hello \${name}!\`;  // String template
}

// Class example
class Counter {
  private count: number = 0;  // Number type
  
  increment(): void {
    this.count++;  // Operator
  }
}` }]
    }
  ]
};

export default function SyntaxTest() {
  const [method, setMethod] = useState<'tiptap' | 'raw' | 'hljs'>('tiptap');
  const [hljsHtml, setHljsHtml] = useState('');
  
  const lowlight = useMemo(() => {
    const low = createLowlight(common);
    low.register('typescript', typescript);
    return low;
  }, []);

  const tiptapHtml = generateHTML(sampleCode, [
    StarterKit.configure({ codeBlock: false }),
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'typescript',
      HTMLAttributes: { class: 'syntax-highlight' },
    }),
  ]);

  const rawHtml = `
    <pre class="syntax-highlight">
      <code class="language-typescript">
        ${sampleCode.content[0].content[0].text}
      </code>
    </pre>
  `;

  useEffect(() => {
    hljs.registerLanguage('typescript', typescript);
    const highlighted = hljs.highlight(sampleCode.content[0].content[0].text, {
      language: 'typescript'
    });
    setHljsHtml(`
      <pre class="hljs">
        <code class="language-typescript">
          ${highlighted.value}
        </code>
      </pre>
    `);
  }, []);

  return (
    <div className="space-y-4 p-4">
      <div className="space-x-4">
        <button 
          onClick={() => setMethod('tiptap')}
          className={`px-4 py-2 rounded ${method === 'tiptap' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          TipTap
        </button>
        <button 
          onClick={() => setMethod('raw')}
          className={`px-4 py-2 rounded ${method === 'raw' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          Raw HTML
        </button>
        <button 
          onClick={() => setMethod('hljs')}
          className={`px-4 py-2 rounded ${method === 'hljs' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          Highlight.js
        </button>
      </div>

      <div className="prose prose-invert max-w-none">
        <h2>Method: {method}</h2>
        
        <h3>Generated HTML:</h3>
        <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
          {method === 'tiptap' ? tiptapHtml :
           method === 'raw' ? rawHtml :
           hljsHtml}
        </pre>

        <h3>Rendered Result:</h3>
        {method === 'tiptap' && (
          <div dangerouslySetInnerHTML={{ __html: tiptapHtml }} />
        )}
        {method === 'raw' && (
          <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
        )}
        {method === 'hljs' && (
          <div dangerouslySetInnerHTML={{ __html: hljsHtml }} />
        )}
      </div>
    </div>
  );
} 