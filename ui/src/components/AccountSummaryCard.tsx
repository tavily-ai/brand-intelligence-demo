import { Building2, MapPin, Users, DollarSign, Network, Compass } from "lucide-react";
import { AccountSummaryData } from "../types";
import FormattedText from "./FormattedText";

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string;
}) {
  if (!value || value === "N/A") return null;
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3.5 h-3.5 text-ink-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-ink-500 uppercase tracking-wider font-medium">
          {label}
        </p>
        <p className="text-[13px] text-ink-200 leading-snug">{value}</p>
      </div>
    </div>
  );
}

export default function AccountSummaryCard({ data }: { data: AccountSummaryData }) {
  return (
    <div className="space-y-4">
      {data.summary && (
        <FormattedText text={data.summary} className="text-[14px]" />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 pt-1">
        <Fact icon={Building2} label="Industry" value={data.industry} />
        <Fact icon={MapPin} label="Headquarters" value={data.headquarters} />
        <Fact icon={Users} label="Employees" value={data.employees} />
        <Fact icon={DollarSign} label="Revenue" value={data.revenue} />
        <Fact icon={Network} label="Parent / Subsidiaries" value={data.parent_or_subsidiaries} />
        <Fact icon={Compass} label="Strategic direction" value={data.strategic_direction} />
      </div>
    </div>
  );
}
