interface Props {
  data: Record<string, any>;
}

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-ink-200 leading-relaxed">{value}</dd>
    </div>
  );
}

function parseProducts(raw: unknown): { name: string; description: string }[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* ignore */ }
  }
  return [];
}

/** Build a logo URL */
function logoUrl(domain: string): string {
  const clean = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  return `https://www.google.com/s2/favicons?domain=${clean}&sz=128`;
}

export default function BrandOverview({ data }: Props) {
  const domain = data.website
    ? data.website.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "")
    : null;

  const products = parseProducts(data.key_products);

  return (
    <div className="space-y-4">
      {/* Summary with logo */}
      <div className="flex items-start gap-5">
        {domain && (
          <img
            src={logoUrl(domain)}
            alt="logo"
            className="w-16 h-16 rounded-xl object-contain bg-white ring-1 ring-ink-800 shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
        {data.summary && (
          <p className="text-sm text-ink-300 leading-relaxed border-l-2 border-accent-400 pl-3 flex-1">
            {data.summary}
          </p>
        )}
      </div>

      {/* Key fields */}
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <Field label="Parent Company" value={data.parent_company} />
        <Field label="Industry" value={data.industry} />
        <Field label="Headquarters" value={data.headquarters} />
        <Field label="Founded" value={data.founded} />
        <Field label="Website" value={data.website} />
        <Field label="Target Audience" value={data.target_audience} />
      </dl>

      {/* Tagline — standalone, visually distinct */}
      {data.tagline && (
        <div className="glass-subtle rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-accent-400 shrink-0" />
          <p className="text-base text-ink-200 italic font-medium">"{data.tagline}"</p>
        </div>
      )}

      {/* Brand values */}
      {data.brand_values && (
        <div className="pt-1">
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-1.5">
            Brand Values
          </dt>
          <dd className="text-sm text-ink-300 leading-relaxed glass-subtle rounded-lg px-3.5 py-2.5">
            {data.brand_values}
          </dd>
        </div>
      )}

      {/* Key products as cards */}
      {products.length > 0 && (
        <div className="pt-1">
          <dt className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-2">
            Key Products & Services
          </dt>
          <dd className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {products.map((p, i) => (
              <div key={i} className="rounded-lg glass-subtle px-3 py-2">
                <div className="text-sm text-ink-200 font-medium">{p.name}</div>
                {p.description && (
                  <div className="text-[11px] text-ink-500 mt-0.5 leading-relaxed">{p.description}</div>
                )}
              </div>
            ))}
          </dd>
        </div>
      )}
    </div>
  );
}
