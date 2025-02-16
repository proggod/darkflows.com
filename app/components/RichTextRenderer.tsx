'use client';

import { useEffect, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import shell from 'highlight.js/lib/languages/shell';
import plaintext from 'highlight.js/lib/languages/plaintext';
import 'highlight.js/styles/github-dark.css';

interface Mark {
  type: string;
  attrs?: {
    href?: string;
    target?: string;
    class?: string;
  };
}

interface Node {
  type: string;
  text?: string;
  marks?: Mark[];
  content?: Array<{
    type: string;
    text?: string;
    marks?: Mark[];
    content?: Array<{
      type: string;
      text?: string;
      marks?: Mark[];
    }>;
    attrs?: {
      language?: string;
      src?: string;
      alt?: string;
      title?: string;
    };
  }>;
  attrs?: {
    language?: string;
    src?: string;
    alt?: string;
    title?: string;
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
    hljs.registerLanguage('cpp', cpp);
    hljs.registerLanguage('c', c);
    hljs.registerLanguage('python', python);
    hljs.registerLanguage('ruby', ruby);
    hljs.registerLanguage('go', go);
    hljs.registerLanguage('rust', rust);
    hljs.registerLanguage('java', java);
    hljs.registerLanguage('shell', shell);
    hljs.registerLanguage('plaintext', plaintext);
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

  // Keep the wrapWithCopyButton helper
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
      console.log('Parsing content:', content);
      const jsonContent = JSON.parse(content) as JsonContent;
      console.log('Parsed JSON:', jsonContent);
      let processedHtml = '';
      
      jsonContent.content.forEach((node: Node, index: number) => {
        console.log(`Processing node ${index}:`, node);
        switch (node.type) {
          case 'image':
            processedHtml += `<img src="${node.attrs?.src}" alt="${node.attrs?.alt || ''}" class="max-w-full rounded-lg" />`;
            break;
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
            console.log('Blockquote node:', node);
            const rawText = node.content?.map(innerNode => {
              console.log('Processing innerNode:', innerNode);
              if (!innerNode.content) {
                console.log('No content in innerNode');
                return '';
              }
              return innerNode.content.map(contentNode => {
                console.log('Processing contentNode:', contentNode);
                if (contentNode.marks?.some(mark => mark.type === 'link')) {
                  const link = contentNode.marks.find(mark => mark.type === 'link');
                  console.log('Found link:', link);
                  return `<a href="${link?.attrs?.href || ''}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300">${contentNode.text}</a>`;
                }
                return contentNode.text;
              }).join('');
            }).filter(Boolean).join('\n') || '';
            
            console.log('Final rawText:', rawText);
            
            // Try escaping semicolons and other special characters
            const escapedText = rawText.replace(/;/g, '&#59;')
                                      .replace(/\|/g, '&#124;');
            
            console.log('Escaped text:', escapedText);
            
            processedHtml += wrapWithCopyButton(
              `<pre class="hljs"><code class="language-shell">${escapedText}</code></pre>`
            );
            break;
          case 'paragraph':
            const paragraphContent = node.content?.[0]?.text || '';
            processedHtml += `<p>${paragraphContent}</p>`;
            break;
          case 'heading':
            processedHtml += `<h1>${node.content?.[0]?.text || ''}</h1>`;
            break;
          default:
            break;
        }
      });

      console.log('Final HTML:', processedHtml);
      setHtml(processedHtml);
    } catch (error) {
      console.error('Error parsing content:', error);
      console.error('Content that caused error:', content);
      setHtml(content);
    }
  }, [content]);

  // Update the languages config and force highlight all code blocks
  useEffect(() => {
    hljs.configure({
      ignoreUnescapedHTML: true,
      languages: [
        'typescript', 
        'javascript', 
        'python', 
        'ruby', 
        'go', 
        'rust', 
        'java', 
        'bash', 
        'json', 
        'html', 
        'css',
        'shell',
        'plaintext'
      ]
    });
    
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [content]);

  return (
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
        [&_pre_code]:!text-xs
        [&_blockquote]:!before:!content-['']
        [&_blockquote]:!after:!content-['']
        [&_blockquote]:!quotes-none
        [&_blockquote]:!not-italic"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
} 