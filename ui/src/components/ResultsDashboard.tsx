import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Fingerprint,
  Newspaper,
  Users,
  BarChart3,
  ShieldAlert,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { CategoriesState, CategoryKey, CATEGORY_LABELS } from "../types";
import CategoryCard from "./CategoryCard";
import BrandOverview from "./BrandOverview";
import MediaPress from "./MediaPress";
import PublicPerception from "./PublicPerception";
import AnalystCompetitive from "./AnalystCompetitive";
import RisksOpportunities from "./RisksOpportunities";

interface Props {
  categories: CategoriesState;
  brandName: string;
}

const TABS: {
  key: CategoryKey;
  icon: React.ElementType;
  component: React.ComponentType<{ data: Record<string, any> }>;
}[] = [
  { key: "brand_overview", icon: Fingerprint, component: BrandOverview },
  { key: "media_press", icon: Newspaper, component: MediaPress },
  { key: "public_perception", icon: Users, component: PublicPerception },
  { key: "analyst_competitive", icon: BarChart3, component: AnalystCompetitive },
  { key: "risks_opportunities", icon: ShieldAlert, component: RisksOpportunities },
];

function StatusDot({ status }: { status: string }) {
  if (status === "completed")
    return <Check className="w-3 h-3 text-emerald-600" />;
  if (status === "error")
    return <AlertCircle className="w-3 h-3 text-red-500" />;
  if (status === "in_progress")
    return <Loader2 className="w-3 h-3 text-accent-500 animate-spin" />;
  return <div className="w-1.5 h-1.5 rounded-full bg-ink-700" />;
}

/** Build a logo URL via Google favicon service */
function logoUrl(domain: string): string {
  const clean = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  return `https://www.google.com/s2/favicons?domain=${clean}&sz=64`;
}

/** Initials fallback for when logo fails */
function Initials({ name }: { name: string }) {
  const initials = name.split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-8 h-8 rounded-md bg-accent-400/15 border border-accent-400/30 flex items-center justify-center text-sm font-bold text-accent-500">
      {initials}
    </div>
  );
}

export default function ResultsDashboard({ categories, brandName }: Props) {
  const [activeTab, setActiveTab] = useState<CategoryKey>("brand_overview");
  const prevCompletedRef = useRef<Set<CategoryKey>>(new Set());
  const [logoFailed, setLogoFailed] = useState(false);

  // Auto-switch to the latest completed tab as results stream in
  useEffect(() => {
    const prevCompleted = prevCompletedRef.current;
    for (const tab of TABS) {
      const state = categories[tab.key];
      if (state.status === "completed" && !prevCompleted.has(tab.key)) {
        setActiveTab(tab.key);
        prevCompleted.add(tab.key);
      }
    }
  }, [categories]);

  const completedCount = Object.values(categories).filter(
    (c) => c.status === "completed"
  ).length;

  const activeState = categories[activeTab];
  const ActiveComp = TABS.find((t) => t.key === activeTab)!.component;

  // Use resolved brand name from API if available, fallback to title-cased input
  const overviewData = categories.brand_overview?.data;
  const displayName = overviewData?.brand_name || brandName.charAt(0).toUpperCase() + brandName.slice(1);

  const domain = overviewData?.website
    ?.replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

  const websiteUrl = domain ? `https://${domain}` : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="mt-10"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        {domain && !logoFailed ? (
          <img
            src={logoUrl(domain)}
            alt={`${displayName} logo`}
            className="w-8 h-8 rounded-md object-contain bg-white ring-1 ring-ink-800"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <Initials name={displayName} />
        )}
        <h2 className="font-display text-xl text-ink-100">{displayName}</h2>
        <span className="text-xs text-ink-500 font-mono">
          {completedCount}/5 categories
        </span>
        {websiteUrl && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-500 hover:text-accent-400 transition-colors"
            title={domain}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.4)' }}>
        {TABS.map((tab) => {
          const state = categories[tab.key];
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const isReady =
            state.status === "completed" || state.status === "in_progress";

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                group relative flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium
                transition-all rounded-t-lg cursor-pointer
                ${
                  isActive
                    ? "glass text-ink-100 -mb-px !border-b-transparent !rounded-b-none"
                    : isReady
                    ? "text-ink-400 hover:text-ink-200 hover:bg-white/20"
                    : "text-ink-600 hover:text-ink-400 hover:bg-white/10"
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">
                {CATEGORY_LABELS[tab.key]}
              </span>
              <StatusDot status={state.status} />
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="glass !rounded-t-none !rounded-b-2xl rounded-tr-2xl overflow-hidden min-h-[300px] !border-t-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <CategoryCard
              title={CATEGORY_LABELS[activeTab]}
              icon={
                (() => {
                  const Icon = TABS.find((t) => t.key === activeTab)!.icon;
                  return <Icon className="w-5 h-5" />;
                })()
              }
              state={activeState}
              delay={0}
              embedded
            >
              <ActiveComp data={activeState.data || {}} />
            </CategoryCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
