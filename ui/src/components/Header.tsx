export default function Header() {
  return (
    <header
      className="sticky top-0 z-40 w-full"
      style={{
        background: "rgba(255, 252, 246, 0.6)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-center gap-4 h-14">
          {/* Tavily wordmark */}
          <a
            href="https://app.tavily.com/home"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 select-none flex items-center"
            aria-label="Tavily"
          >
            <img
              src="/tavily-full.svg"
              alt="Tavily"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </a>

          {/* Divider */}
          <span
            className="h-6 w-px shrink-0"
            style={{ background: "var(--color-border-strong)" }}
          />

          {/* Product name */}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-[15px] font-medium text-ink-100 leading-tight truncate">
              Account Intelligence
            </span>
          </div>

          {/* Right: powered-by note */}
          <span className="ml-auto shrink-0 hidden sm:block text-[11px] text-ink-500 leading-none">
            Powered by the Tavily Research API
          </span>
        </div>
      </div>
    </header>
  );
}
