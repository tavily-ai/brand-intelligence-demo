import { motion } from "framer-motion";
import { Loader2, Zap, ChevronRight, Trash2, AlertCircle } from "lucide-react";
import { Account, AccountResearch, actionableCount, CATEGORY_ORDER } from "../types";
import AccountLogo from "./AccountLogo";

interface Props {
  account: Account;
  research: AccountResearch;
  index: number;
  onOpen: () => void;
  onRemove: () => void;
}

function liveMessage(research: AccountResearch): string {
  for (const key of CATEGORY_ORDER) {
    const c = research.categories[key];
    if (c.status === "in_progress" && c.progressMessage) return c.progressMessage;
  }
  return "Researching…";
}

function StatusCell({ research }: { research: AccountResearch }) {
  const count = actionableCount(research);

  if (research.status === "researching") {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <Loader2 className="w-3.5 h-3.5 text-accent-500 animate-spin shrink-0" />
        <span className="text-xs text-accent-600 font-medium truncate max-w-[180px]">
          {liveMessage(research)}
        </span>
      </div>
    );
  }

  if (research.status === "error") {
    return (
      <div className="flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
        <span className="text-xs text-red-500 font-medium">Failed</span>
      </div>
    );
  }

  if (research.status === "done") {
    const total = research.news.length;
    return (
      <div className="flex items-center gap-2">
        {count > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
            <Zap className="w-3 h-3" />
            {count} actionable
          </span>
        ) : (
          <span className="text-[11px] text-ink-500">No signals</span>
        )}
        <span className="text-[11px] text-ink-500 font-mono hidden sm:inline">
          {total} news
        </span>
      </div>
    );
  }

  return <span className="text-xs text-ink-500">Not researched</span>;
}

export default function AccountRow({ account, research, index, onOpen, onRemove }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.3 }}
      onClick={onOpen}
      className="group glass rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-lg hover:bg-white/60 transition-all"
    >
      <AccountLogo name={account.name} domain={account.domain} size={40} />

      {/* Name + industry */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-ink-100 truncate">
          {account.name}
        </p>
        <p className="text-xs text-ink-400 truncate">
          {account.industry || "—"}
        </p>
      </div>

      {/* HQ */}
      <div className="hidden md:block w-44 shrink-0 min-w-0">
        <p className="text-xs text-ink-400 truncate">{account.headquarters || "—"}</p>
      </div>

      {/* Status */}
      <div className="w-auto sm:w-52 shrink-0 flex justify-end sm:justify-start">
        <StatusCell research={research} />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 rounded-md text-ink-600 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 transition-all"
          title={`Remove ${account.name}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <ChevronRight className="w-4 h-4 text-ink-500 group-hover:text-ink-300 transition-colors" />
      </div>
    </motion.div>
  );
}
