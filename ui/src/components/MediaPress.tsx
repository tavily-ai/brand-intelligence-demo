import { ExternalLink } from "lucide-react";
import { Source } from "../types";

interface Props {
  data: Record<string, any>;
}

function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function buildFaviconMap(sources: Source[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const s of sources) {
    if (!s.favicon) continue;
    const domain = getDomain(s.url);
    if (domain && !map.has(domain)) {
      map.set(domain, s.favicon);
    }
  }
  return map;
}

/** Try to resolve a favicon for a press item via its URL or source name */
function resolveFavicon(
  item: any,
  faviconMap: Map<string, string>
): { faviconUrl: string | null; domain: string | null; linkUrl: string | null } {
  // First try the item's explicit URL
  if (item.url) {
    const domain = getDomain(item.url);
    if (domain) {
      const fav = faviconMap.get(domain);
      if (fav) return { faviconUrl: fav, domain, linkUrl: item.url };
      // Fallback: try Google's favicon service
      return { faviconUrl: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`, domain, linkUrl: item.url };
    }
  }
  // Try matching source name against favicon map domains
  if (item.source) {
    const srcLower = item.source.toLowerCase();
    for (const [domain, fav] of faviconMap) {
      if (domain.toLowerCase().includes(srcLower) || srcLower.includes(domain.toLowerCase().replace(/\..+$/, ""))) {
        return { faviconUrl: fav, domain, linkUrl: null };
      }
    }
  }
  return { faviconUrl: null, domain: null, linkUrl: null };
}

function parsePressItems(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* ignore */ }
  }
  return [];
}

/** Sort by date descending (YYYY-MM format). Items without dates go last. */
function sortByDateDesc(items: any[]): any[] {
  return [...items].sort((a, b) => {
    const da = a.date || "";
    const db = b.date || "";
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return db.localeCompare(da);
  });
}

/** Convert YYYY-MM to readable format like "Mar 2025" */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const match = dateStr.match(/^(\d{4})-(\d{2})$/);
  if (!match) return dateStr; // fallback: return as-is
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIdx = parseInt(match[2], 10) - 1;
  return `${months[monthIdx] || match[2]} ${match[1]}`;
}

const SENTIMENT_STYLES: Record<string, { dot: string; text: string }> = {
  positive: { dot: "bg-emerald-500", text: "text-emerald-600" },
  neutral: { dot: "bg-blue-400", text: "text-blue-500" },
  negative: { dot: "bg-red-500", text: "text-red-500" },
};

const TONE_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  positive: { bg: "bg-emerald-500/10", border: "border-emerald-400/40", text: "text-emerald-600" },
  mixed: { bg: "bg-amber-500/10", border: "border-amber-400/40", text: "text-amber-600" },
  negative: { bg: "bg-red-500/10", border: "border-red-400/40", text: "text-red-500" },
};

export default function MediaPress({ data }: Props) {
  const pressItems = sortByDateDesc(parsePressItems(data.press_items));
  const tone = (data.overall_tone || "").toLowerCase();
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.mixed;
  const apiSources: Source[] = Array.isArray(data._sources) ? data._sources : [];
  const faviconMap = buildFaviconMap(apiSources);

  return (
    <div className="space-y-4">
      {/* Summary with tone badge */}
      <div className="flex items-start gap-3">
        {tone && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${toneStyle.bg} ${toneStyle.border} ${toneStyle.text} shrink-0 mt-0.5`}>
            {tone}
          </span>
        )}
        {data.summary && (
          <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3">
            {data.summary}
          </p>
        )}
      </div>

      {/* Press items — sorted latest first */}
      {pressItems.length > 0 && (
        <div className="space-y-2">
          {pressItems.map((item: any, i: number) => {
            const sentiment = (item.sentiment || "").toLowerCase();
            const style = SENTIMENT_STYLES[sentiment] || SENTIMENT_STYLES.neutral;

            const { faviconUrl, domain, linkUrl } = resolveFavicon(item, faviconMap);

            return (
              <div key={i} className="p-3 rounded-lg glass-subtle">
                <div className="flex items-start gap-2">
                  {/* Favicon or sentiment dot */}
                  {faviconUrl ? (
                    <a
                      href={linkUrl || item.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 mt-0.5 opacity-70 hover:opacity-100 transition-opacity"
                      title={domain || item.source || ""}
                    >
                      <img
                        src={faviconUrl}
                        alt={domain || item.source || ""}
                        className="w-4 h-4 rounded-sm"
                        onError={(e) => {
                          // Hide broken favicon, show fallback dot
                          (e.target as HTMLImageElement).style.display = "none";
                          const dot = (e.target as HTMLImageElement).nextElementSibling;
                          if (dot) (dot as HTMLElement).style.display = "block";
                        }}
                      />
                      <div className={`w-1.5 h-1.5 rounded-full ${style.dot} mt-1 hidden`} />
                    </a>
                  ) : (
                    <div className={`w-1.5 h-1.5 rounded-full ${style.dot} mt-1.5 shrink-0`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-ink-100 font-medium">{item.headline}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {item.source && (
                        <span className="text-[11px] text-ink-500 font-medium">{item.source}</span>
                      )}
                      {item.date && (
                        <span className="text-[11px] text-ink-600">· {formatDate(item.date)}</span>
                      )}
                      <span className={`text-[10px] uppercase tracking-wider font-semibold ${style.text}`}>
                        {sentiment}
                      </span>
                    </div>
                    {item.summary && (
                      <p className="text-xs text-ink-400 mt-1.5 leading-relaxed">{item.summary}</p>
                    )}
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ink-500 hover:text-accent-400 transition-colors shrink-0 mt-0.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PR Crises */}
      {data.pr_crises && (
        <div className="pt-1">
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-1">
            PR Crises
          </dt>
          <dd className="text-sm text-ink-300 leading-relaxed glass-subtle rounded-lg px-3.5 py-2.5">
            {data.pr_crises}
          </dd>
        </div>
      )}

      {/* Earned media highlights */}
      {data.earned_media_highlights && (
        <div className="pt-1">
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-1">
            Earned Media Highlights
          </dt>
          <dd className="text-sm text-ink-300 leading-relaxed glass-subtle rounded-lg px-3.5 py-2.5">
            {data.earned_media_highlights}
          </dd>
        </div>
      )}
    </div>
  );
}
