import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { Account, AccountResearch, actionableCount, initialResearch } from "../types";
import AccountRow from "./AccountRow";

interface Props {
  accounts: Account[];
  researchMap: Record<string, AccountResearch>;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  onAdd: (name: string) => void;
  onResearchAll: () => void;
  researchingCount: number;
}

export default function AccountList({
  accounts,
  researchMap,
  onOpen,
  onRemove,
  onAdd,
  onResearchAll,
  researchingCount,
}: Props) {
  const [newName, setNewName] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (name) {
      onAdd(name);
      setNewName("");
    }
  };

  const researchedCount = accounts.filter(
    (a) => researchMap[a.id]?.status === "done"
  ).length;
  const totalActionable = accounts.reduce(
    (sum, a) => sum + actionableCount(researchMap[a.id]),
    0
  );
  const anyResearching = researchingCount > 0;
  const allDone = researchedCount === accounts.length && accounts.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-ink-100">Your accounts</h2>
          <p className="text-xs text-ink-400 mt-0.5">
            {accounts.length} accounts · {researchedCount} researched ·{" "}
            <span className="text-emerald-700 font-medium">
              {totalActionable} actionable signals
            </span>
          </p>
        </div>

        <button
          onClick={onResearchAll}
          disabled={anyResearching || accounts.length === 0}
          className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-ink-100 shrink-0"
        >
          {anyResearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Researching {researchingCount}…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {allDone ? "Refresh all" : "Research all"}
            </>
          )}
        </button>
      </div>

      {/* Add account */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Add an account (any company name)…"
          className="flex-1 px-4 py-2.5 glass-input rounded-xl text-ink-100 placeholder:text-ink-500 font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent-400/30 transition-all"
        />
        <button
          type="submit"
          disabled={!newName.trim()}
          className="glass-button inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-ink-200 disabled:opacity-50 disabled:cursor-default shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {/* List header (desktop) */}
      <div className="hidden md:flex items-center gap-3 px-4 pb-2 text-[10px] uppercase tracking-wider text-ink-500 font-medium">
        <div className="w-10" />
        <div className="flex-1">Account</div>
        <div className="w-44">Headquarters</div>
        <div className="w-52">Status</div>
        <div className="w-14" />
      </div>

      {/* Rows */}
      <div className="space-y-2">
        {accounts.map((account, i) => (
          <AccountRow
            key={account.id}
            account={account}
            research={researchMap[account.id] || initialResearch()}
            index={i}
            onOpen={() => onOpen(account.id)}
            onRemove={() => onRemove(account.id)}
          />
        ))}

        {accounts.length === 0 && (
          <div className="glass-subtle rounded-xl py-12 text-center">
            <p className="text-sm text-ink-400">
              No accounts yet — add one above to get started.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
