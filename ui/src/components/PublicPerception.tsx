import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";

interface Props {
  data: Record<string, any>;
}

function parseArray(raw: unknown): any[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* ignore */ }
  }
  return [];
}

const SENTIMENT_BADGE: Record<string, { bg: string; border: string; text: string }> = {
  positive: { bg: "bg-emerald-500/10", border: "border-emerald-400/40", text: "text-emerald-600" },
  mixed: { bg: "bg-amber-500/10", border: "border-amber-400/40", text: "text-amber-600" },
  negative: { bg: "bg-red-500/10", border: "border-red-400/40", text: "text-red-500" },
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function PublicPerception({ data }: Props) {
  const sentiment = (data.overall_sentiment || "").toLowerCase();
  const sentimentStyle = SENTIMENT_BADGE[sentiment] || SENTIMENT_BADGE.mixed;
  const reviewScores = parseArray(data.review_scores);
  const praise = parseArray(data.common_praise);
  const complaints = parseArray(data.common_complaints);

  return (
    <div className="space-y-4">
      {/* Summary with sentiment badge */}
      <div className="flex items-start gap-3">
        {sentiment && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${sentimentStyle.bg} ${sentimentStyle.border} ${sentimentStyle.text} shrink-0 mt-0.5`}>
            {sentiment}
          </span>
        )}
        {data.summary && (
          <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3">
            {data.summary}
          </p>
        )}
      </div>

      {/* Review scores — full width cards */}
      {reviewScores.length > 0 && (
        <div>
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-2">
            Review Scores
          </dt>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {reviewScores.map((r: any, i: number) => {
              const Wrapper = r.url ? "a" : "div";
              const linkProps = r.url
                ? { href: r.url, target: "_blank", rel: "noopener noreferrer" }
                : {};

              return (
                <Wrapper
                  key={i}
                  {...linkProps}
                  className={`glass-subtle rounded-lg px-4 py-3 flex items-center gap-3 ${
                    r.url ? "hover:bg-white/[0.08] hover:border-white/[0.15] transition-all group cursor-pointer" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-ink-500 font-medium uppercase tracking-wider">
                      {r.platform}
                    </div>
                    <div className="text-xl font-semibold text-ink-100 mt-0.5">
                      {r.score}
                    </div>
                    {r.review_count && (
                      <div className="text-[10px] text-ink-600 mt-0.5">{r.review_count}</div>
                    )}
                  </div>
                  {r.url && (
                    <ExternalLink className="w-3.5 h-3.5 text-ink-600 group-hover:text-accent-400 transition-colors shrink-0" />
                  )}
                </Wrapper>
              );
            })}
          </div>
        </div>
      )}

      {/* Praise vs Complaints — two columns */}
      {(praise.length > 0 || complaints.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Praise column */}
          {praise.length > 0 && (
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] text-emerald-600 uppercase tracking-wider font-medium mb-2">
                <ThumbsUp className="w-3 h-3" />
                What People Love
              </dt>
              <div className="space-y-2">
                {praise.map((p: any, i: number) => (
                  <div key={i} className="glass-subtle rounded-lg px-3 py-2 border-l-2 border-emerald-400/50">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-ink-200 font-medium flex-1">{p.theme}</div>
                      {p.source_url && (
                        <a
                          href={p.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-600 hover:text-accent-400 transition-colors shrink-0"
                          title={getDomain(p.source_url)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {p.detail && (
                      <div className="text-xs text-ink-400 mt-0.5 leading-relaxed">{p.detail}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complaints column */}
          {complaints.length > 0 && (
            <div>
              <dt className="flex items-center gap-1.5 text-[11px] text-red-500 uppercase tracking-wider font-medium mb-2">
                <ThumbsDown className="w-3 h-3" />
                Common Complaints
              </dt>
              <div className="space-y-2">
                {complaints.map((c: any, i: number) => (
                  <div key={i} className="glass-subtle rounded-lg px-3 py-2 border-l-2 border-red-400/50">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-ink-200 font-medium flex-1">{c.theme}</div>
                      {c.source_url && (
                        <a
                          href={c.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-600 hover:text-accent-400 transition-colors shrink-0"
                          title={getDomain(c.source_url)}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {c.detail && (
                      <div className="text-xs text-ink-400 mt-0.5 leading-relaxed">{c.detail}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
