export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-4 h-14">
          {/* Oracle wordmark */}
          <a
            href="https://www.oracle.com"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 select-none"
            aria-label="Oracle Fusion"
          >
            <span
              className="font-display font-semibold text-[22px] leading-none"
              style={{ color: "var(--color-red)", letterSpacing: "0.06em" }}
            >
              ORACLE
            </span>
          </a>

          {/* Divider */}
          <span
            className="h-6 w-px shrink-0"
            style={{ background: "var(--color-border-strong)" }}
          />

          {/* Product name */}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[15px] font-semibold text-ink-100 leading-tight truncate">
              Account Intelligence
            </span>
            {/* <span className="text-[11px] text-ink-500 leading-tight truncate">
              Fusion Sales · Account Signals
            </span> */}
          </div>

          {/* Right: "Powered by Tavily" — mono wordmark blends with Redwood neutrals */}
          <a
            href="https://tavily.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto shrink-0 hidden sm:flex items-center gap-2 group"
            title="Powered by the Tavily Research API"
          >
            <span className="text-[11px] text-ink-500 leading-none">Powered by</span>
            <img
              src="/tavily-logo.svg"
              alt="Tavily"
              className="h-[18px] w-auto object-contain opacity-65 group-hover:opacity-100 transition-opacity"
            />
          </a>
        </div>
      </div>
    </header>
  );
}
