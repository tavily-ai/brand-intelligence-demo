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

export interface CategoryState {
  status: CategoryStatus;
  data: Record<string, any> | null;
  sources: Source[];
  progressMessage: string;
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

export function initialCategoriesState(): CategoriesState {
  const blank = { status: "pending" as const, data: null, sources: [] as Source[], progressMessage: "" };
  const state: Partial<CategoriesState> = {};
  for (const key of CATEGORY_ORDER) {
    state[key] = { ...blank };
  }
  return state as CategoriesState;
}
