'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import 'highlight.js/styles/github.min.css';

export default function MarkdownRenderer({ content, className = '' }) {
    return (
        <div className={className}>
            <ReactMarkdown
                // GFM aktif: list, autolink, ~~strike~~, |tabel|
                remarkPlugins={[remarkGfm]}
                // highlight code + sanitize
                rehypePlugins={[rehypeHighlight, rehypeSanitize]}
                // override elemen tertentu untuk styling/tweak
                components={{
                    // inline code vs code block
                    code({ inline, className, children, ...props }) {
                        return inline ? (
                            <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em]">
                                {children}
                            </code>
                        ) : (
                            <pre className="overflow-x-auto rounded-lg border border-gray-200 p-3 bg-gray-50">
                                <code
                                    className={`${className ?? ''} break-words`}
                                    {...props}
                                >
                                    {children}
                                </code>
                            </pre>
                        );
                    },
                    a({ children, href, ...props }) {
                        return (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer nofollow"
                                className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    ul({ children }) {
                        return (
                            <ul className="list-disc pl-5 space-y-1">
                                {children}
                            </ul>
                        );
                    },
                    ol({ children }) {
                        return (
                            <ol className="list-decimal pl-5 space-y-1">
                                {children}
                            </ol>
                        );
                    },
                }}
            >
                {content || ''}
            </ReactMarkdown>
        </div>
    );
}
