export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
