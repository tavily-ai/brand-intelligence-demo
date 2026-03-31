import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MessageSquare, X } from "lucide-react";

interface Props {
  onSearch: (brandName: string, context: string) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export default function SearchForm({ onSearch, isLoading, onCancel }: Props) {
  const [brandName, setBrandName] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim()) {
      onSearch(brandName.trim(), context.trim());
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Brand name input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 z-10" />
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Brand name"
            className="w-full pl-11 pr-4 py-3.5 glass-input rounded-xl text-ink-100 placeholder:text-ink-600 font-body text-[15px] focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400/30 transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Context input */}
        <div className="relative sm:w-80">
          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 z-10" />
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Additional context (optional)"
            className="w-full pl-11 pr-4 py-3.5 glass-input rounded-xl text-ink-100 placeholder:text-ink-600 font-body text-[15px] focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400/30 transition-all"
            disabled={isLoading}
          />
        </div>

        {/* Action button */}
        {isLoading ? (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3.5 glass-button text-ink-300 rounded-xl font-medium text-[15px] transition-all flex items-center gap-2 shrink-0"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        ) : (
          <button
            type="submit"
            disabled={!brandName.trim()}
            className={`px-8 py-3.5 rounded-xl font-semibold text-[15px] transition-all duration-300 shrink-0 ${
              brandName.trim()
                ? "glass-button-active text-ink-200"
                : "glass-input text-ink-600 cursor-default"
            }`}
          >
            Research
          </button>
        )}
      </div>
    </motion.form>
  );
}
