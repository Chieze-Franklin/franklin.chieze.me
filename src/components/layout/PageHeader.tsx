export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mx-auto max-w-3xl px-6 pt-32 pb-14 text-center sm:pt-40 sm:pb-20">
      <p className="eyebrow rise mb-4" style={{ color: "var(--accent)" }}>
        {eyebrow}
      </p>
      <h1
        className="display rise"
        style={{ fontSize: "clamp(2.6rem, 7vw, 4.5rem)", color: "var(--text)", animationDelay: "0.1s" }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="rise mx-auto mt-5 max-w-xl text-[17px] leading-relaxed sm:text-[19px]"
          style={{ color: "var(--text-2)", animationDelay: "0.2s" }}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
