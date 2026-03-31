import FormattedText from "./FormattedText";

interface Props {
  label: string;
  value?: string;
}

export default function InfoBlock({ label, value }: Props) {
  if (!value) return null;
  return (
    <div className="p-3 rounded-lg glass-subtle">
      <p className="text-[11px] text-ink-500 uppercase tracking-wider font-medium mb-1.5">
        {label}
      </p>
      <FormattedText text={value} />
    </div>
  );
}
