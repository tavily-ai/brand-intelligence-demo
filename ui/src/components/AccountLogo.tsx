import { useState } from "react";

interface Props {
  name: string;
  domain?: string;
  size?: number;
}

/** Clean a domain string down to a bare hostname. */
export function cleanDomain(domain?: string): string | undefined {
  if (!domain) return undefined;
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .trim() || undefined;
}

function logoUrl(domain: string, size: number): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size >= 64 ? 128 : 64}`;
}

function initials(name: string): string {
  return name
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Company logo via favicon service, with a tasteful monogram fallback. */
export default function AccountLogo({ name, domain, size = 40 }: Props) {
  const clean = cleanDomain(domain);
  const [failed, setFailed] = useState(false);

  const px = { width: size, height: size };
  const radius = Math.round(size * 0.28);

  if (clean && !failed) {
    return (
      <img
        src={logoUrl(clean, size)}
        alt={`${name} logo`}
        style={{ ...px, borderRadius: radius }}
        className="object-contain bg-white ring-1 ring-ink-800/60 shrink-0"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      style={{ ...px, borderRadius: radius, fontSize: size * 0.36 }}
      className="flex items-center justify-center bg-accent-500/12 ring-1 ring-accent-500/25 font-semibold text-accent-600 shrink-0"
    >
      {initials(name)}
    </div>
  );
}
