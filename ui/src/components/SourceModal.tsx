import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, Loader2, FileText, AlertCircle } from "lucide-react";
import { NewsItem } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Props {
  item: NewsItem;
  onClose: () => void;
}

function getDomain(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function SourceModal({ item, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Fetch the extracted content for this URL
  useEffect(() => {
    let cancelled = false;
    if (!item.url) {
      setError("This item has no source URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    setContent("");

    fetch(`${API_URL}/api/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: item.url }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else {
          setContent(data.content || "");
          setTitle(data.title || "");
          if (!data.content) setError("No content could be extracted from this URL.");
        }
      })
      .catch((e) => !cancelled && setError(e.message || "Failed to load content."))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [item.url]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink-100/40" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="glass relative z-10 w-full max-w-2xl max-h-[85vh] rounded-xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div
          className="flex items-start gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-accent-500 font-semibold mb-1">
              Source content
            </p>
            <h3 className="text-[15px] font-semibold text-ink-100 leading-snug">
              {title || item.headline || getDomain(item.url)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-500 hover:text-ink-200 hover:bg-ink-850 transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4 space-y-4">
          {/* URL */}
          {item.url && (
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-500 font-medium mb-1.5">
                Source URL
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[13px] text-accent-500 hover:text-accent-600 break-all transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                {item.url}
              </a>
            </div>
          )}

          {/* Content */}
          <div>
            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-ink-500 font-medium mb-2">
              <FileText className="w-3 h-3" />
              Extracted content
            </p>

            {loading && (
              <div className="flex items-center gap-2 text-sm text-ink-400 py-6 justify-center">
                <Loader2 className="w-4 h-4 text-accent-500 animate-spin" />
                Extracting content from source…
              </div>
            )}

            {!loading && error && (
              <div className="flex items-start gap-2 text-sm text-ink-400 bg-ink-900 border border-ink-800 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {!loading && !error && content && (
              <div className="max-h-[40vh] overflow-y-auto rounded-lg bg-ink-950 border border-ink-800 px-3.5 py-3">
                <pre className="whitespace-pre-wrap break-words font-body text-[12.5px] leading-relaxed text-ink-300">
                  {content}
                </pre>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
