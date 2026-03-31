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

const RATING_STYLES: Record<string, string> = {
  leader: "bg-emerald-500/15 text-emerald-600 border-emerald-400/40",
  "strong performer": "bg-blue-500/15 text-blue-500 border-blue-400/40",
  visionary: "bg-purple-500/15 text-purple-500 border-purple-400/40",
  challenger: "bg-amber-500/15 text-amber-600 border-amber-400/40",
  niche: "bg-ink-800 text-ink-400 border-ink-700",
};

function ratingStyle(rating: string): string {
  const lower = rating.toLowerCase();
  for (const [key, style] of Object.entries(RATING_STYLES)) {
    if (lower.includes(key)) return style;
  }
  return "bg-ink-850 text-ink-300 border-ink-700";
}

export default function AnalystCompetitive({ data }: Props) {
  const analystRatings = parseArray(data.analyst_ratings);
  const competitors = parseArray(data.competitors);

  return (
    <div className="space-y-4">
      {/* Summary */}
      {data.summary && (
        <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3">
          {data.summary}
        </p>
      )}

      {/* Analyst ratings as badge chips */}
      {analystRatings.length > 0 && (
        <div>
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-2">
            Analyst Ratings
          </dt>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analystRatings.map((r: any, i: number) => (
              <div key={i} className="glass-subtle rounded-lg px-3.5 py-2.5 flex items-start gap-3">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shrink-0 mt-0.5 ${ratingStyle(r.rating || "")}`}>
                  {r.rating}
                </span>
                <div className="min-w-0">
                  <div className="text-sm text-ink-200 font-medium">{r.firm}</div>
                  {r.report && (
                    <div className="text-[11px] text-ink-500 mt-0.5">{r.report}</div>
                  )}
                  {r.detail && (
                    <div className="text-xs text-ink-400 mt-1 leading-relaxed">{r.detail}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive landscape table */}
      {competitors.length > 0 && (
        <div>
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-2">
            Competitive Landscape
          </dt>
          <div className="glass-subtle rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left px-3.5 py-2 text-[11px] text-ink-500 uppercase tracking-wider font-medium">Competitor</th>
                  <th className="text-left px-3.5 py-2 text-[11px] text-ink-500 uppercase tracking-wider font-medium">Market Share</th>
                  <th className="text-left px-3.5 py-2 text-[11px] text-ink-500 uppercase tracking-wider font-medium">Key Strength</th>
                  <th className="text-left px-3.5 py-2 text-[11px] text-ink-500 uppercase tracking-wider font-medium hidden md:table-cell">Positioning</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((c: any, i: number) => (
                  <tr key={i} className={i < competitors.length - 1 ? "border-b border-white/10" : ""}>
                    <td className="px-3.5 py-2 text-ink-200 font-medium">{c.name}</td>
                    <td className="px-3.5 py-2 text-ink-400 font-mono text-xs">{c.market_share || "—"}</td>
                    <td className="px-3.5 py-2 text-ink-400">{c.key_strength || "—"}</td>
                    <td className="px-3.5 py-2 text-ink-400 hidden md:table-cell">{c.positioning || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Market position */}
      {data.market_position && (
        <div>
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-1">
            Market Position
          </dt>
          <dd className="text-sm text-ink-300 leading-relaxed glass-subtle rounded-lg px-3.5 py-2.5">
            {data.market_position}
          </dd>
        </div>
      )}

      {/* Awards */}
      {data.awards && (
        <div>
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-1">
            Awards & Recognition
          </dt>
          <dd className="text-sm text-ink-300 leading-relaxed glass-subtle rounded-lg px-3.5 py-2.5">
            {data.awards}
          </dd>
        </div>
      )}
    </div>
  );
}
