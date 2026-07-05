import { motion } from "framer-motion";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start justify-between gap-4"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-100 tracking-tight">
          Account Intelligence
        </h1>
        <p className="mt-1.5 text-sm text-ink-400 font-body max-w-xl">
          Fresh, sourced account news for sellers — powered by the{" "}
          <a
            href="https://tavily.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-500 hover:text-accent-600 transition-colors"
          >
            Tavily Research API
          </a>
          .
        </p>
      </div>

      <a
        href="https://app.tavily.com/home"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 pt-0.5"
      >
        <img
          src="/tavily-full.svg"
          alt="Tavily"
          className="h-6 sm:h-7 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
        />
      </a>
    </motion.div>
  );
}
