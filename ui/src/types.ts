export interface Source {
  title: string;
  url: string;
  favicon?: string;
}

export type CategoryKey =
  | "brand_overview"
  | "media_press"
  | "public_perception"
  | "analyst_competitive"
  | "risks_opportunities";

export type CategoryStatus = "pending" | "in_progress" | "completed" | "error";

export type ResearchPhase = "planning" | "searching" | "analyzing" | "generating";

export interface CategoryState {
  status: CategoryStatus;
  data: Record<string, any> | null;
  sources: Source[];
  progressMessage: string;
  phase: ResearchPhase | null;
  queries: string[];
}

export type CategoriesState = Record<CategoryKey, CategoryState>;

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  brand_overview: "Brand Overview",
  media_press: "Media & Press",
  public_perception: "Public Perception",
  analyst_competitive: "Analyst & Competitive",
  risks_opportunities: "Risks & Opportunities",
};

export const CATEGORY_ORDER: CategoryKey[] = [
  "brand_overview",
  "media_press",
  "public_perception",
  "analyst_competitive",
  "risks_opportunities",
];

export const PHASE_LABELS: Record<ResearchPhase, string> = {
  planning: "Planning",
  searching: "Searching",
  analyzing: "Analyzing",
  generating: "Generating",
};

export function initialCategoriesState(): CategoriesState {
  const blank: CategoryState = {
    status: "pending",
    data: null,
    sources: [],
    progressMessage: "",
    phase: null,
    queries: [],
  };
  const state: Partial<CategoriesState> = {};
  for (const key of CATEGORY_ORDER) {
    state[key] = { ...blank };
  }
  return state as CategoriesState;
}
