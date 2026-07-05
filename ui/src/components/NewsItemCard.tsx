import { motion } from "framer-motion";
import { ExternalLink, Zap, Target, FileText } from "lucide-react";
import { NewsItem } from "../types";

/** Category → chip color. */
const CATEGORY_STYLES: Record<string, string> = {
  Earnings: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  "M&A": "bg-purple-500/10 text-purple-700 border-purple-500/20",
  Funding: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Leadership: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  "Layoffs/Restructuring": "bg-red-500/10 text-red-700 border-red-500/20",
  "Product/Strategy": "bg-indigo-500/10 text-indigo-700 border-indigo-500/20",
  Expansion: "bg-teal-500/10 text-teal-700 border-teal-500/20",
  "Regulatory/Legal": "bg-orange-500/10 text-orange-700 border-orange-500/20",
  "Security Incident": "bg-rose-500/10 text-rose-700 border-rose-500/20",
  Partnership: "bg-cyan-500/10 text-cyan-700 border-cyan-500/20",
  Other: "bg-ink-500/10 text-ink-400 border-ink-500/20",
};

function getDomain(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(date?: string): string {
  if (!date) return "";
  // Accept YYYY-MM-DD or YYYY-MM
  const parts = date.split("-");
  const [y, m, d] = parts;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const mi = m ? parseInt(m, 10) - 1 : -1;
  if (mi >= 0 && mi < 12) {
    return d ? `${months[mi]} ${parseInt(d, 10)}, ${y}` : `${months[mi]} ${y}`;
  }
  return date;
}

interface Props {
  item: NewsItem;
  index: number;
  onViewSource?: (item: NewsItem) => void;
}

export default function NewsItemCard({ item, index, onViewSource }: Props) {
  const actionable = !!item.actionable;
  const catStyle = CATEGORY_STYLES[item.category || "Other"] || CATEGORY_STYLES.Other;
  const domain = getDomain(item.url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-xl px-4 py-3.5 transition-all ${
        actionable
          ? "glass border-l-[3px] border-l-emerald-500"
          : "glass-subtle opacity-[0.82] hover:opacity-100"
      }`}
    >
      {/* Top row: date + category + actionable tag */}
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="text-xs font-mono text-ink-500">{formatDate(item.date)}</span>
        {item.category && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${catStyle}`}>
            {item.category}
          </span>
        )}
        <span className="ml-auto">
          {actionable ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
              <Zap className="w-3 h-3" />
              Actionable
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full bg-ink-500/8 text-ink-500 border border-ink-500/15">
              Context
            </span>
          )}
        </span>
      </div>

      {/* Headline */}
      <h4 className={`text-[15px] leading-snug ${actionable ? "font-semibold text-ink-100" : "font-medium text-ink-200"}`}>
        {item.headline}
      </h4>

      {/* Summary */}
      {item.summary && (
        <p className="mt-1 text-[13px] text-ink-400 leading-relaxed">{item.summary}</p>
      )}

      {/* Suggested action (actionable only) */}
      {actionable && item.suggested_action && (
        <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-emerald-500/8 border border-emerald-500/20 px-3 py-2">
          <Target className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-[13px] text-emerald-800 leading-snug">
            <span className="font-semibold">Suggested action: </span>
            {item.suggested_action}
          </p>
        </div>
      )}

      {/* Source citation — opens the Tavily result (queries + content + URL) */}
      {item.url && (
        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onViewSource?.(item)}
            className="inline-flex items-center gap-1.5 text-[11px] text-ink-500 hover:text-accent-500 transition-colors group"
            title="View the Tavily result: queries, content and URL"
          >
            <FileText className="w-3 h-3" />
            <span className="font-medium">{item.source_name || domain}</span>
            {item.source_name && domain && (
              <span className="text-ink-600 group-hover:text-accent-400">· {domain}</span>
            )}
          </button>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-600 hover:text-accent-500 transition-colors"
            title="Open original article"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </motion.div>
  );
}
