'use client';

import { useEffect, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import 'highlight.js/styles/github-dark.css';

interface Node {
  type: string;
  content?: Array<{
    type: string;
    text?: string;
    content?: Array<{
      type: string;
      text?: string;
    }>;
    attrs?: {
      language?: string;
    };
  }>;
  attrs?: {
    language?: string;
  };
}

interface JsonContent {
  type: string;
  content: Node[];
}

interface RichTextRendererProps {
  content: string;
}

export default function RichTextRenderer({ content }: RichTextRendererProps) {
  const [html, setHtml] = useState('');
  const [debug, setDebug] = useState({
    isJson: false,
    hasCodeBlocks: false,
    highlightStatus: 'Not initialized',
    codeBlocksFound: 0,
    generatedHtml: '',
    tokenExample: ''
  });

  // Initialize highlight.js
  useEffect(() => {
    hljs.registerLanguage('typescript', typescript);
  }, []);

  // Parse and highlight content
  useEffect(() => {
    try {
      const jsonContent = JSON.parse(content) as JsonContent;
      const codeBlocks = jsonContent.content.filter(
        (node: Node) => node.type === 'codeBlock'
      );

      let processedHtml = '';
      jsonContent.content.forEach((node: Node) => {
        switch (node.type) {
          case 'codeBlock':
            const code = node.content?.[0]?.text || '';
            const highlighted = hljs.highlight(code, {
              language: 'typescript'
            }).value;
            processedHtml += `<pre class="hljs"><code class="language-typescript">${highlighted}</code></pre>`;
            break;
          case 'blockquote':
            let blockquoteContent = '';
            node.content?.forEach(innerNode => {
              if (innerNode.type === 'codeBlock') {
                const code = innerNode.content?.[0]?.text || '';
                const highlighted = hljs.highlight(code, {
                  language: innerNode.attrs?.language || 'typescript'
                }).value;
                blockquoteContent += `<pre class="hljs"><code class="language-typescript">${highlighted}</code></pre>`;
              }
            });
            processedHtml += `<blockquote>${blockquoteContent}</blockquote>`;
            break;
          case 'paragraph':
            processedHtml += `<p>${node.content?.[0]?.text || ''}</p>`;
            break;
          case 'heading':
            processedHtml += `<h1>${node.content?.[0]?.text || ''}</h1>`;
            break;
          default:
            // Silently skip unhandled node types
            break;
        }
      });

      setHtml(processedHtml);
      setDebug(prev => ({
        ...prev,
        isJson: true,
        hasCodeBlocks: codeBlocks.length > 0,
        codeBlocksFound: codeBlocks.length,
        generatedHtml: processedHtml.slice(0, 200) + '...',
        highlightStatus: 'Processed with highlight.js'
      }));
    } catch (e) {
      setHtml(content);
      setDebug(prev => ({
        ...prev,
        isJson: false,
        hasCodeBlocks: content.includes('<pre><code'),
        generatedHtml: content.slice(0, 200) + '...',
        highlightStatus: `Error: ${e}`
      }));
    }
  }, [content]);

  // Generate sample HTML for test section
  const sampleCode = `// Sample TypeScript code
function hello(name: string): string {
  return \`Hello \${name}!\`;  // String template
}`;

  const sampleHtml = `
    <pre class="hljs"><code class="language-typescript">${
      hljs.highlight(sampleCode, {
        language: 'typescript'
      }).value
    }</code></pre>
  `;

  return (
    <>
      {/* Debug panel - uncomment for testing
      <div className="mb-4 p-2 bg-gray-800 rounded text-xs">
        <div className="text-gray-400">
          Format: {debug.isJson ? 'JSON' : 'HTML'} |
          Code Blocks: {debug.hasCodeBlocks ? 'Yes' : 'No'} |
          Blocks Found: {debug.codeBlocksFound} |
          Highlight: {debug.highlightStatus}
          <details className="mt-1">
            <summary>Generated HTML</summary>
            <pre className="mt-1 p-1 bg-gray-900 rounded overflow-x-auto">
              {debug.generatedHtml}
            </pre>
          </details>
          <details className="mt-1">
            <summary>Token Example</summary>
            <pre className="mt-1 p-1 bg-gray-900 rounded overflow-x-auto">
              {debug.tokenExample}
            </pre>
          </details>
        </div>
      </div>
      */}

      {/* Real content */}
      <div 
        className="prose prose-invert max-w-none w-full mb-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Test section - uncomment for testing
      <div className="border-t border-gray-800 pt-8 mt-8">
        <h2 className="text-xl font-bold mb-4">Test Section</h2>
        <div 
          className="prose prose-invert max-w-none w-full
            [&_pre]:!bg-[#0d1117]
            [&_pre]:!p-4
            [&_pre]:!rounded-lg
            [&_pre]:!text-sm
            [&_pre]:!leading-relaxed
            [&_pre]:!overflow-x-auto
            [&_pre_code]:!p-0
            [&_pre_code]:!font-mono
            [&_pre_code]:!text-sm
            [&_.hljs-comment]:!text-[#8b949e]
            [&_.hljs-keyword]:!text-[#ff7b72]
            [&_.hljs-string]:!text-[#a5d6ff]
            [&_.hljs-number]:!text-[#79c0ff]
            [&_.hljs-title]:!text-[#d2a8ff]
            [&_.hljs-params]:!text-[#e1e4e8]
            [&_.hljs-type]:!text-[#ffa657]"
          dangerouslySetInnerHTML={{ __html: sampleHtml }}
        />
      </div>
      */}
    </>
  );
} 