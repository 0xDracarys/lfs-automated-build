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
    <main className="min-h-screen bg-transparent text-white relative overflow-hidden pt-24 pb-20 font-sora">
        {/* Content */}
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documentation Index
          </Link>
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-gray-300 font-medium">Loading documentation...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <FileText className="h-16 w-16 text-gray-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 uppercase tracking-wide">{error}</h2>
            <p className="text-gray-400 mb-6 text-sm">This documentation page does not exist yet</p>
            <Link
              href="/docs"
              className="px-6 py-3 bg-primary text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all"
            >
              Browse All Docs
            </Link>
          </div>
        )}

        {!loading && !error && content && (
          <article className="prose prose-invert prose-lg max-w-none bg-black/65 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-12 shadow-2xl">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-3xl sm:text-4xl font-extrabold mb-6 text-white uppercase tracking-tight border-b border-white/10 pb-4" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-2xl font-bold mb-4 mt-8 text-white uppercase tracking-wide border-b border-white/5 pb-2" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-xl font-bold mb-3 mt-6 text-primary uppercase tracking-wider" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="text-gray-300 mb-4 leading-relaxed text-sm sm:text-base font-light" {...props} />
                ),
                a: ({ node, ...props }) => (
                  <a className="text-primary hover:underline font-medium" {...props} />
                ),
                code: ({ node, inline, ...props }: any) =>
                  inline ? (
                    <code className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded text-primary text-xs font-mono" {...props} />
                  ) : (
                    <code className="block" {...props} />
                  ),
                pre: ({ node, ...props }) => (
                  <pre className="bg-black/80 rounded-xl p-5 overflow-x-auto border border-white/10 my-6 font-mono text-xs sm:text-sm text-gray-200" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-4 text-gray-300 space-y-2 text-sm sm:text-base font-light" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-2 text-sm sm:text-base font-light" {...props} />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-primary bg-primary/5 pl-6 py-3 my-6 italic text-gray-300 rounded-r-xl" {...props} />
                ),
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-6">
                    <table className="w-full border-collapse border border-white/10 text-sm" {...props} />
                  </div>
                ),
                th: ({ node, ...props }) => (
                  <th className="border border-white/10 px-4 py-3 bg-black/60 text-left font-bold text-primary uppercase tracking-wider text-xs" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="border border-white/10 px-4 py-3 text-gray-300" {...props} />
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
