import { motion } from "framer-motion";
import { Globe, ExternalLink, Loader2 } from "lucide-react";
import { CategoryState, Source } from "../types";
import SourcesList from "./SourcesList";

interface Props {
  title: string;
  icon: React.ReactNode;
  state: CategoryState;
  children: React.ReactNode;
  accentColor?: string;
  delay?: number;
  embedded?: boolean;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function LiveProgress({ state }: { state: CategoryState }) {
  const { sources, progressMessage } = state;

  return (
    <div className="space-y-4">
      {/* Phase + message */}
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-accent-500 animate-spin shrink-0" />
        <span className="text-sm text-ink-300 font-medium">
          {progressMessage || "Starting research..."}
        </span>
      </div>

      {/* Sources trickling in */}
      {sources.length > 0 && (
        <div>
          <p className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-2">
            Sources Found ({sources.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {sources
              .filter((s, i, arr) => arr.findIndex((x) => x.url === s.url) === i)
              .slice(0, 20)
              .map((src, i) => (
              <motion.a
                key={src.url}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02, duration: 0.15 }}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md
                  bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.06]
                  hover:border-white/[0.12] transition-all group"
                title={src.title || src.url}
              >
                {src.favicon ? (
                  <img src={src.favicon} alt="" className="w-3 h-3 rounded-sm shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <ExternalLink className="w-2.5 h-2.5 text-ink-500 shrink-0" />
                )}
                <span className="text-[10px] text-ink-400 group-hover:text-accent-400 truncate max-w-[120px] transition-colors">
                  {getDomain(src.url)}
                </span>
              </motion.a>
            ))}
            {sources.length > 20 && (
              <span className="text-[10px] text-ink-600 self-center ml-1">
                +{sources.length - 20} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Fallback shimmer when no data yet */}
      {sources.length === 0 && (
        <div className="space-y-3">
          <div className="h-4 w-3/4 rounded animate-shimmer" />
          <div className="h-4 w-1/2 rounded animate-shimmer" />
          <div className="h-4 w-5/6 rounded animate-shimmer" />
        </div>
      )}
    </div>
  );
}

export default function CategoryCard({
  title,
  icon,
  state,
  children,
  accentColor = "accent",
  delay = 0,
  embedded = false,
}: Props) {
  if (state.status === "pending") return null;

  const isLoading = state.status === "in_progress";
  const isError = state.status === "error";

  const Wrapper = embedded ? "div" : motion.div;
  const wrapperProps = embedded
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={
        embedded
          ? ""
          : "glass rounded-2xl overflow-hidden"
      }
    >
      {/* Card header — hidden when embedded (tab bar already shows the title) */}
      {!embedded && (
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
          <div className="text-ink-500">{icon}</div>
          <h3 className="font-display text-lg text-ink-100">{title}</h3>
          {state.status === "completed" && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-emerald-600 font-medium uppercase tracking-wider">
                Complete
              </span>
            </div>
          )}
        </div>
      )}

      {/* Card body */}
      <div className={embedded ? "px-6 py-5" : "px-5 py-4"}>
        {isLoading && <LiveProgress state={state} />}
        {isError && (
          <p className="text-sm text-red-600">{state.progressMessage}</p>
        )}
        {state.status === "completed" && state.data && children}
      </div>

      {/* Sources */}
      {state.sources.length > 0 && state.status === "completed" && (
        <div className={embedded ? "px-6 pb-5" : "px-5 pb-4"}>
          <SourcesList sources={state.sources} />
        </div>
      )}
    </Wrapper>
  );
}
