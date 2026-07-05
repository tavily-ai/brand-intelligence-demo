export interface Source {
  title: string;
  url: string;
  favicon?: string;
}

/* ── Research categories (per account) ───────────────────────────────── */

export type CategoryKey = "account_summary" | "recent_news";

export type CategoryStatus = "pending" | "in_progress" | "completed" | "error";

export type ResearchPhase = "planning" | "searching" | "analyzing" | "generating";

export interface CategoryState {
  status: CategoryStatus;
  progressMessage: string;
  phase: ResearchPhase | null;
  queries: string[];
  sources: Source[];
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  account_summary: "Account Summary",
  recent_news: "Recent News",
};

export const CATEGORY_ORDER: CategoryKey[] = ["account_summary", "recent_news"];

export const PHASE_LABELS: Record<ResearchPhase, string> = {
  planning: "Planning",
  searching: "Searching",
  analyzing: "Analyzing",
  generating: "Generating",
};

/* ── Structured research output ──────────────────────────────────────── */

export interface AccountSummaryData {
  company_name?: string;
  summary?: string;
  industry?: string;
  headquarters?: string;
  employees?: string;
  revenue?: string;
  parent_or_subsidiaries?: string;
  strategic_direction?: string;
  website?: string;
}

export interface NewsItem {
  date?: string;
  headline?: string;
  summary?: string;
  category?: string;
  source_name?: string;
  url?: string;
  actionable?: boolean;
  suggested_action?: string;
}

/* ── Accounts (the seller's book) ────────────────────────────────────── */

export type AccountStatus = "not_researched" | "researching" | "done" | "error";

export interface Account {
  id: string;
  name: string;
  industry?: string;
  headquarters?: string;
  /** Primary domain, used for the logo (e.g. "servicenow.com"). */
  domain?: string;
}

export interface AccountResearch {
  status: AccountStatus;
  summary: AccountSummaryData | null;
  news: NewsItem[];
  summarySources: Source[];
  newsSources: Source[];
  categories: Record<CategoryKey, CategoryState>;
  error?: string;
  /** Timestamp (ms) of the last completed research run. */
  researchedAt?: number;
}

export function blankCategoryState(): CategoryState {
  return {
    status: "pending",
    progressMessage: "",
    phase: null,
    queries: [],
    sources: [],
  };
}

export function initialResearch(): AccountResearch {
  return {
    status: "not_researched",
    summary: null,
    news: [],
    summarySources: [],
    newsSources: [],
    categories: {
      account_summary: blankCategoryState(),
      recent_news: blankCategoryState(),
    },
  };
}

/** Count of actionable news items — the badge on each account row. */
export function actionableCount(research: AccountResearch | undefined): number {
  if (!research) return 0;
  return research.news.filter((n) => n.actionable).length;
}
