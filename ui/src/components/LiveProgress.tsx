import { motion } from "framer-motion";
import { Loader2, Check, Globe } from "lucide-react";
import {
  AccountResearch,
  CategoryKey,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  CategoryState,
  Source,
} from "../types";

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function dedupeSources(sources: Source[]): Source[] {
  return sources.filter((s, i, arr) => arr.findIndex((x) => x.url === s.url) === i);
}

function CategoryProgress({ label, state }: { label: string; state: CategoryState }) {
  const done = state.status === "completed";
  const sources = dedupeSources(state.sources);

  return (
    <div className="glass-subtle rounded-xl px-4 py-3.5">
      <div className="flex items-center gap-2 mb-2">
        {done ? (
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          <Loader2 className="w-4 h-4 text-accent-500 animate-spin shrink-0" />
        )}
        <span className="text-sm font-medium text-ink-200">{label}</span>
        <span className="ml-auto text-xs text-ink-500 truncate">
          {done ? "Complete" : state.progressMessage || "Starting…"}
        </span>
      </div>

      {state.queries.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {state.queries.slice(0, 6).map((q) => (
            <span
              key={q}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/40 border border-white/60"
            >
              <Globe className="w-3 h-3 text-ink-500 shrink-0" />
              <span className="text-[11px] text-ink-400 font-mono truncate max-w-[220px]">
                {q}
              </span>
            </span>
          ))}
          {state.queries.length > 6 && (
            <span className="text-[11px] text-ink-500 self-center">
              +{state.queries.length - 6} more
            </span>
          )}
        </div>
      )}

      {sources.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {sources.slice(0, 14).map((src, i) => (
            <motion.a
              key={src.url}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02, duration: 0.15 }}
              title={src.title || src.url}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/30 hover:bg-white/60 border border-white/50 transition-all group"
            >
              {src.favicon ? (
                <img
                  src={src.favicon}
                  alt=""
                  className="w-3 h-3 rounded-sm shrink-0"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              ) : (
                <Globe className="w-2.5 h-2.5 text-ink-500 shrink-0" />
              )}
              <span className="text-[10px] text-ink-400 group-hover:text-accent-500 truncate max-w-[120px] transition-colors">
                {getDomain(src.url)}
              </span>
            </motion.a>
          ))}
          {sources.length > 14 && (
            <span className="text-[10px] text-ink-500 self-center ml-1">
              +{sources.length - 14} more
            </span>
          )}
        </div>
      )}

      {state.queries.length === 0 && sources.length === 0 && !done && (
        <div className="space-y-2">
          <div className="h-3.5 w-3/4 rounded animate-shimmer" />
          <div className="h-3.5 w-1/2 rounded animate-shimmer" />
        </div>
      )}
    </div>
  );
}

export default function LiveProgress({ research }: { research: AccountResearch }) {
  return (
    <div className="space-y-3">
      {CATEGORY_ORDER.map((key: CategoryKey) => (
        <CategoryProgress
          key={key}
          label={CATEGORY_LABELS[key]}
          state={research.categories[key]}
        />
      ))}
    </div>
  );
}
