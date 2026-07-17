export function AdminHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-10">
      <a
        href="/admin"
        className="text-xs uppercase tracking-[0.3em] font-semibold mb-2 inline-block"
        style={{ color: "var(--accent)" }}
      >
        ← Admin
      </a>
      <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
        {title}
      </h1>
      <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
        {subtitle}
      </p>
    </div>
  );
}
