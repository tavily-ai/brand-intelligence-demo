import { useState, useCallback, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import AccountList from "./components/AccountList";
import AccountDetail from "./components/AccountDetail";
import { SEED_ACCOUNTS } from "./accounts";
import {
  Account,
  AccountResearch,
  CategoryKey,
  initialResearch,
  ResearchPhase,
} from "./types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const CONCURRENCY = 3;

type View = { type: "list" } | { type: "detail"; id: string };

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || `account-${Date.now()}`
  );
}

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>(SEED_ACCOUNTS);
  const [researchMap, setResearchMap] = useState<Record<string, AccountResearch>>(
    {}
  );
  const [view, setView] = useState<View>({ type: "list" });
  const [researchingIds, setResearchingIds] = useState<Set<string>>(new Set());

  const abortControllers = useRef<Record<string, AbortController>>({});

  /* ── State helpers ─────────────────────────────────────────────────── */

  const patchResearch = useCallback(
    (id: string, updater: (r: AccountResearch) => AccountResearch) => {
      setResearchMap((prev) => ({
        ...prev,
        [id]: updater(prev[id] || initialResearch()),
      }));
    },
    []
  );

  const patchCategory = useCallback(
    (
      id: string,
      cat: CategoryKey,
      updater: (c: AccountResearch["categories"][CategoryKey]) => AccountResearch["categories"][CategoryKey]
    ) => {
      patchResearch(id, (r) => ({
        ...r,
        categories: { ...r.categories, [cat]: updater(r.categories[cat]) },
      }));
    },
    [patchResearch]
  );

  /* ── Event handling ────────────────────────────────────────────────── */

  const handleEvent = useCallback(
    (id: string, event: any) => {
      const cat = event.category as CategoryKey | undefined;

      switch (event.type) {
        case "start":
          break;

        case "progress":
          if (cat) {
            patchCategory(id, cat, (c) => ({
              ...c,
              status: "in_progress",
              progressMessage: event.message || c.progressMessage,
              phase: (event.phase as ResearchPhase) || c.phase,
              queries: event.queries?.length
                ? [...new Set([...c.queries, ...event.queries])]
                : c.queries,
            }));
          }
          break;

        case "sources_found":
          if (cat) {
            patchCategory(id, cat, (c) => ({
              ...c,
              sources: [...c.sources, ...(event.sources || [])],
            }));
          }
          break;

        case "category_complete":
          if (cat === "account_summary") {
            patchResearch(id, (r) => ({
              ...r,
              summary: event.data || r.summary,
              summarySources: event.sources || r.summarySources,
              categories: {
                ...r.categories,
                account_summary: {
                  ...r.categories.account_summary,
                  status: "completed",
                  progressMessage: "",
                },
              },
            }));
          } else if (cat === "recent_news") {
            const items = Array.isArray(event.data?.news_items)
              ? event.data.news_items
              : [];
            patchResearch(id, (r) => ({
              ...r,
              news: items,
              newsSources: event.sources || r.newsSources,
              categories: {
                ...r.categories,
                recent_news: {
                  ...r.categories.recent_news,
                  status: "completed",
                  progressMessage: "",
                },
              },
            }));
          }
          break;

        case "error":
          if (cat) {
            patchCategory(id, cat, (c) => ({
              ...c,
              status: "error",
              progressMessage: event.message || "An error occurred",
            }));
          } else {
            patchResearch(id, (r) => ({
              ...r,
              status: "error",
              error: event.message || "An error occurred",
            }));
          }
          break;

        case "complete":
          break;
      }
    },
    [patchCategory, patchResearch]
  );

  /* ── Streaming research for a single account ───────────────────────── */

  const researchAccount = useCallback(
    async (account: Account) => {
      const id = account.id;

      // Abort any in-flight run for this account
      abortControllers.current[id]?.abort();
      const controller = new AbortController();
      abortControllers.current[id] = controller;

      // Reset to a fresh researching state
      patchResearch(id, () => ({
        ...initialResearch(),
        status: "researching",
        categories: {
          account_summary: {
            status: "in_progress",
            progressMessage: "Starting…",
            phase: null,
            queries: [],
            sources: [],
          },
          recent_news: {
            status: "in_progress",
            progressMessage: "Starting…",
            phase: null,
            queries: [],
            sources: [],
          },
        },
      }));
      setResearchingIds((prev) => new Set(prev).add(id));

      try {
        const response = await fetch(`${API_URL}/api/account/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account_name: account.name,
            industry: account.industry || undefined,
          }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(response.statusText || "Request failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                handleEvent(id, JSON.parse(line.slice(6)));
              } catch {
                /* skip malformed */
              }
            }
          }
        }

        // Mark done (preserve error status if a category errored fatally)
        patchResearch(id, (r) => ({
          ...r,
          status: r.status === "error" ? "error" : "done",
          researchedAt: Date.now(),
        }));
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error(`Research error for ${account.name}:`, err);
          patchResearch(id, (r) => ({
            ...r,
            status: "error",
            error: err.message || "Research failed",
          }));
        }
      } finally {
        setResearchingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [handleEvent, patchResearch]
  );

  /* ── Research all (concurrency-capped) ─────────────────────────────── */

  const researchAll = useCallback(async () => {
    const queue = [...accounts];
    const runNext = async (): Promise<void> => {
      const account = queue.shift();
      if (!account) return;
      await researchAccount(account);
      return runNext();
    };
    const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () =>
      runNext()
    );
    await Promise.all(workers);
  }, [accounts, researchAccount]);

  /* ── Account CRUD ──────────────────────────────────────────────────── */

  const handleAdd = useCallback((name: string) => {
    setAccounts((prev) => {
      let id = slugify(name);
      while (prev.some((a) => a.id === id)) id = `${id}-${prev.length}`;
      return [{ id, name }, ...prev];
    });
  }, []);

  const handleRemove = useCallback((id: string) => {
    abortControllers.current[id]?.abort();
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    setResearchMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleOpen = useCallback(
    (id: string) => {
      setView({ type: "detail", id });
      const r = researchMap[id];
      if (!r || r.status === "not_researched") {
        const account = accounts.find((a) => a.id === id);
        if (account) researchAccount(account);
      }
    },
    [accounts, researchMap, researchAccount]
  );

  const handleRefresh = useCallback(
    (id: string) => {
      const account = accounts.find((a) => a.id === id);
      if (account) researchAccount(account);
    },
    [accounts, researchAccount]
  );

  /* ── Render ────────────────────────────────────────────────────────── */

  const detailAccount =
    view.type === "detail" ? accounts.find((a) => a.id === view.id) : undefined;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)" }}>
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div>
          <AnimatePresence mode="wait">
            {view.type === "list" || !detailAccount ? (
              <AccountList
                key="list"
                accounts={accounts}
                researchMap={researchMap}
                onOpen={handleOpen}
                onRemove={handleRemove}
                onAdd={handleAdd}
                onResearchAll={researchAll}
                researchingCount={researchingIds.size}
              />
            ) : (
              <AccountDetail
                key={`detail-${detailAccount.id}`}
                account={detailAccount}
                research={researchMap[detailAccount.id] || initialResearch()}
                onBack={() => setView({ type: "list" })}
                onRefresh={() => handleRefresh(detailAccount.id)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
