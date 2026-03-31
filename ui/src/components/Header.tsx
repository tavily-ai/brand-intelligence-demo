import { motion } from "framer-motion";
import { Radar } from "lucide-react";

export default function Header() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex items-center gap-3">
        <Radar className="w-6 h-6 text-accent-400" />
        <h1 className="font-display text-2xl font-semibold text-ink-100">
          Brand Intelligence
        </h1>
      </div>
      <p className="mt-1.5 text-sm text-ink-400 font-body max-w-xl">
        Enter a brand name to get a real-time reputation audit covering media
        sentiment, public perception, analyst ratings, and competitive positioning.
      </p>
    </motion.div>
  );
}
