"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { DottedSurface } from "@/components/ui/dotted-surface";
import "highlight.js/styles/github-dark.css";

export default function DocPage() {
  const params = useParams();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDoc() {
      try {
        setLoading(true);
        setError(null);

        // Get the slug path
        const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug];
        const docPath = slugArray.join("/");

        // Try to fetch the markdown file
        const response = await fetch(`/api/docs/${docPath}`);
        
        if (!response.ok) {
          setError("Documentation not found");
          setLoading(false);
          return;
        }

        const data = await response.json();
        setContent(data.content);
        setLoading(false);
      } catch (err) {
        console.error("Error loading doc:", err);
        setError("Failed to load documentation");
        setLoading(false);
      }
    }

    loadDoc();
  }, [params.slug]);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Background */}
        <DottedSurface className="opacity-20" />

        {/* Content */}
        <div className="container mx-auto px-6 pt-8 pb-20 max-w-4xl">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Docs
          </Link>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading documentation...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <FileText className="h-16 w-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">{error}</h2>
            <p className="text-gray-400 mb-6">This documentation page does not exist yet</p>
            <Link
              href="/docs"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
            >
              Browse All Docs
            </Link>
          </div>
        )}

        {!loading && !error && content && (
          <article className="prose prose-invert prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-3xl font-bold mb-4 mt-8" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-2xl font-bold mb-3 mt-6" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-gray-300 mb-4 leading-relaxed" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-blue-400 hover:text-blue-300 underline" {...props} />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code className="px-2 py-1 bg-white/10 rounded text-blue-400 text-sm" {...props} />
                  ) : (
                    <code className="block" {...props} />
                  ),
                pre: ({ node, ...props }) => (
                  <pre className="bg-gray-900 rounded-xl p-6 overflow-x-auto border border-white/10 my-6" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 text-gray-300 space-y-2" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-2" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-6 italic text-gray-400" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse border border-white/10" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-white/10 px-4 py-2 bg-white/5 text-left font-semibold" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-white/10 px-4 py-2" {...props} />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        )}
        </div>
      </main>
  );
}
