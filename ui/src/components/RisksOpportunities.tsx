import { ExternalLink, AlertTriangle, Lightbulb } from "lucide-react";

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

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  high: { bg: "bg-red-500/10", border: "border-red-400/50", text: "text-red-500" },
  medium: { bg: "bg-amber-500/10", border: "border-amber-400/50", text: "text-amber-600" },
  low: { bg: "bg-blue-500/10", border: "border-blue-400/50", text: "text-blue-500" },
};

const POTENTIAL_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  high: { bg: "bg-emerald-500/10", border: "border-emerald-400/50", text: "text-emerald-600" },
  medium: { bg: "bg-blue-500/10", border: "border-blue-400/50", text: "text-blue-500" },
  low: { bg: "bg-ink-850", border: "border-ink-700", text: "text-ink-400" },
};

export default function RisksOpportunities({ data }: Props) {
  const risks = parseArray(data.risks);
  const opportunities = parseArray(data.opportunities);

  return (
    <div className="space-y-4">
      {/* Summary */}
      {data.summary && (
        <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3">
          {data.summary}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Risks column */}
        {risks.length > 0 && (
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] text-red-500 uppercase tracking-wider font-medium mb-2">
              <AlertTriangle className="w-3 h-3" />
              Risks
            </dt>
            <div className="space-y-2">
              {risks.map((r: any, i: number) => {
                const severity = (r.severity || "medium").toLowerCase();
                const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.medium;

                return (
                  <div key={i} className={`rounded-lg px-3.5 py-2.5 glass-subtle border-l-2 ${style.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                        {severity}
                      </span>
                      {r.category && (
                        <span className="text-[11px] text-ink-500 font-medium">{r.category}</span>
                      )}
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto text-ink-600 hover:text-accent-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    {r.description && (
                      <p className="text-xs text-ink-400 leading-relaxed">{r.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Opportunities column */}
        {opportunities.length > 0 && (
          <div>
            <dt className="flex items-center gap-1.5 text-[11px] text-emerald-600 uppercase tracking-wider font-medium mb-2">
              <Lightbulb className="w-3 h-3" />
              Opportunities
            </dt>
            <div className="space-y-2">
              {opportunities.map((o: any, i: number) => {
                const potential = (o.potential || "medium").toLowerCase();
                const style = POTENTIAL_STYLES[potential] || POTENTIAL_STYLES.medium;

                return (
                  <div key={i} className={`rounded-lg px-3.5 py-2.5 glass-subtle border-l-2 ${style.border}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
                        {potential}
                      </span>
                      {o.area && (
                        <span className="text-[11px] text-ink-500 font-medium">{o.area}</span>
                      )}
                    </div>
                    {o.description && (
                      <p className="text-xs text-ink-400 leading-relaxed">{o.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
