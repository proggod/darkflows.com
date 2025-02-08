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

  // Initialize highlight.js
  useEffect(() => {
    hljs.registerLanguage('typescript', typescript);
  }, []);

  // Add copy handler
  useEffect(() => {
    const codeBlocks = document.querySelectorAll('.code-block-wrapper');
    codeBlocks.forEach(wrapper => {
      const copyButton = wrapper.querySelector('.copy-button');
      const copyMessage = wrapper.querySelector('.copy-message');
      const codeElement = wrapper.querySelector('code');
      
      copyButton?.addEventListener('click', () => {
        const code = codeElement?.textContent || '';
        navigator.clipboard.writeText(code);
        
        // Show feedback
        const icon = copyButton.querySelector('svg');
        icon?.classList.add('text-green-400');
        copyMessage?.classList.remove('opacity-0');
        
        setTimeout(() => {
          icon?.classList.remove('text-green-400');
          copyMessage?.classList.add('opacity-0');
        }, 2000);
      });
    });
  }, [html]);

  // Modify the code block HTML generation
  const wrapWithCopyButton = (codeHtml: string) => `
    <div class="code-block-wrapper relative">
      <div class="absolute right-2 top-2 flex items-center gap-2">
        <span class="copy-message opacity-0 text-xs text-green-400 transition-opacity">Copied!</span>
        <button class="copy-button p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 hover:text-white transition-colors">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
          </svg>
        </button>
      </div>
      ${codeHtml}
    </div>
  `;

  // Parse and highlight content
  useEffect(() => {
    try {
      const jsonContent = JSON.parse(content) as JsonContent;
      let processedHtml = '';
      
      jsonContent.content.forEach((node: Node) => {
        switch (node.type) {
          case 'codeBlock':
            const code = node.content?.[0]?.text || '';
            const highlighted = hljs.highlight(code, {
              language: 'typescript'
            }).value;
            processedHtml += wrapWithCopyButton(
              `<pre class="hljs"><code class="language-typescript">${highlighted}</code></pre>`
            );
            break;
          case 'blockquote':
            let blockquoteContent = '';
            node.content?.forEach(innerNode => {
              if (innerNode.type === 'codeBlock') {
                const code = innerNode.content?.[0]?.text || '';
                const highlighted = hljs.highlight(code, {
                  language: innerNode.attrs?.language || 'typescript'
                }).value;
                blockquoteContent += wrapWithCopyButton(
                  `<pre class="hljs"><code class="language-typescript">${highlighted}</code></pre>`
                );
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
    } catch {
      setHtml(content);
    }
  }, [content]);
{/*
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
*/}
  return (
    <>
      {/* Real content */}
      <div 
        className="prose prose-invert max-w-none w-full mb-8
          [&_pre]:!bg-[#0d1117]
          [&_pre]:!p-4
          [&_pre]:!rounded-lg
          [&_pre]:!text-xs
          [&_pre]:!leading-relaxed
          [&_pre]:!overflow-x-auto
          [&_pre_code]:!p-0
          [&_pre_code]:!font-mono
          [&_pre_code]:!text-xs"
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