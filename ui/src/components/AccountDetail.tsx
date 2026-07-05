import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, RefreshCw, ExternalLink, Loader2, Building2 } from "lucide-react";
import { Account, AccountResearch, NewsItem, Source } from "../types";
import AccountLogo, { cleanDomain } from "./AccountLogo";
import AccountSummaryCard from "./AccountSummaryCard";
import LiveProgress from "./LiveProgress";
import NewsFeed from "./NewsFeed";
import SourcesList from "./SourcesList";
import SourceModal from "./SourceModal";

interface Props {
  account: Account;
  research: AccountResearch;
  onBack: () => void;
  onRefresh: () => void;
}

function relativeTime(ts?: number): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function AccountDetail({ account, research, onBack, onRefresh }: Props) {
  const [sourceItem, setSourceItem] = useState<NewsItem | null>(null);
  const isResearching = research.status === "researching";
  const summaryData = research.summary;
  const summaryDone = research.categories.account_summary.status === "completed";
  const newsDone = research.categories.recent_news.status === "completed";

  // Resolved domain (prefer freshly-researched website)
  const domain = cleanDomain(summaryData?.website) || cleanDomain(account.domain);
  const websiteUrl = domain ? `https://${domain}` : null;
  const displayName = summaryData?.company_name || account.name;

  const allSources: Source[] = [...research.summarySources, ...research.newsSources];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Back */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-200 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        All accounts
      </button>

      {/* Header */}
      <div className="glass rounded-2xl px-5 py-4 mb-4">
        <div className="flex items-start gap-4">
          <AccountLogo name={displayName} domain={domain} size={52} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-semibold text-ink-100">{displayName}</h2>
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-500 hover:text-accent-500 transition-colors"
                  title={domain}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <p className="text-sm text-ink-400 mt-0.5">
              {summaryData?.industry || account.industry || ""}
            </p>
            {(summaryData?.headquarters || account.headquarters) && (
              <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                {summaryData?.headquarters || account.headquarters}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isResearching}
              className="glass-button inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium text-ink-200 disabled:opacity-60"
            >
              {isResearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              {isResearching ? "Researching…" : "Refresh"}
            </button>
            {research.researchedAt && !isResearching && (
              <span className="text-[10px] text-ink-500">
                Updated {relativeTime(research.researchedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {research.status === "error" && (
        <div className="glass-subtle rounded-xl px-4 py-3 mb-4 border-l-[3px] border-l-red-500">
          <p className="text-sm text-red-600">
            {research.error || "Research failed. Try refreshing."}
          </p>
        </div>
      )}

      {/* Account Summary */}
      <div className="glass rounded-2xl px-5 py-4 mb-4">
        <h3 className="text-sm font-semibold text-ink-100 uppercase tracking-wider mb-3">
          Account Summary
        </h3>
        {summaryData ? (
          <AccountSummaryCard data={summaryData} />
        ) : summaryDone ? (
          <p className="text-sm text-ink-400">No summary available.</p>
        ) : (
          <div className="flex items-center gap-2 text-sm text-ink-400">
            <Loader2 className="w-4 h-4 text-accent-500 animate-spin" />
            {research.categories.account_summary.progressMessage || "Building snapshot…"}
          </div>
        )}
      </div>

      {/* Live progress while researching news */}
      {isResearching && !newsDone && (
        <div className="mb-4">
          <LiveProgress research={research} />
        </div>
      )}

      {/* Recent News */}
      {(newsDone || research.news.length > 0) && (
        <div className="glass rounded-2xl px-5 py-4">
          <h3 className="text-sm font-semibold text-ink-100 uppercase tracking-wider mb-4">
            Recent News{" "}
            <span className="text-ink-500 font-normal normal-case">
              · last ~90 days
            </span>
          </h3>
          <NewsFeed news={research.news} onViewSource={setSourceItem} />

          {allSources.length > 0 && (
            <div className="mt-5">
              <SourcesList sources={allSources} />
            </div>
          )}
        </div>
      )}

      {/* Source result modal — queries + extracted content + URL */}
      <AnimatePresence>
        {sourceItem && (
          <SourceModal
            item={sourceItem}
            queries={research.categories.recent_news.queries}
            onClose={() => setSourceItem(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
