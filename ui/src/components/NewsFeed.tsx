import { Newspaper, Zap } from "lucide-react";
import { NewsItem } from "../types";
import NewsItemCard from "./NewsItemCard";

/** Parse a YYYY-MM-DD / YYYY-MM date into a sortable number (newest = larger). */
function dateKey(date?: string): number {
  if (!date) return 0;
  const [y, m = "01", d = "01"] = date.split("-");
  const n = parseInt(`${y}${m.padStart(2, "0")}${d.padStart(2, "0")}`, 10);
  return isNaN(n) ? 0 : n;
}

function byDateDesc(a: NewsItem, b: NewsItem): number {
  return dateKey(b.date) - dateKey(a.date);
}

interface Props {
  news: NewsItem[];
  onViewSource?: (item: NewsItem) => void;
}

export default function NewsFeed({ news, onViewSource }: Props) {
  if (!news || news.length === 0) {
    return (
      <div className="text-center py-12">
        <Newspaper className="w-8 h-8 text-ink-600 mx-auto mb-3" />
        <p className="text-sm text-ink-400">No recent news found for this account.</p>
      </div>
    );
  }

  const actionable = news.filter((n) => n.actionable).sort(byDateDesc);
  const context = news.filter((n) => !n.actionable).sort(byDateDesc);

  return (
    <div className="space-y-5">
      {actionable.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Zap className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-ink-100">
              Actionable signals
            </h3>
            <span className="text-xs text-ink-500 font-mono">
              {actionable.length}
            </span>
          </div>
          <div className="space-y-2.5">
            {actionable.map((item, i) => (
              <NewsItemCard key={`a-${i}`} item={item} index={i} onViewSource={onViewSource} />
            ))}
          </div>
        </div>
      )}

      {context.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Newspaper className="w-4 h-4 text-ink-500" />
            <h3 className="text-sm font-medium text-ink-300">Context</h3>
            <span className="text-xs text-ink-500 font-mono">{context.length}</span>
          </div>
          <div className="space-y-2.5">
            {context.map((item, i) => (
              <NewsItemCard key={`c-${i}`} item={item} index={i} onViewSource={onViewSource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
