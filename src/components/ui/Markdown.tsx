import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

/**
 * Renders a markdown string with GFM support; links open in a new tab.
 * Pass `allowHtml` to also render raw HTML embedded in the markdown (trusted,
 * admin-authored content only).
 */
export function Markdown({
  children,
  className,
  allowHtml = false,
}: {
  children: string;
  className?: string;
  allowHtml?: boolean;
}) {
  return (
    <div className={`markdown${className ? ` ${className}` : ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={allowHtml ? [rehypeRaw] : []}
        components={{
          // Inline spacing so it renders sanely even without the global stylesheet
          // (e.g. the résumé print window, which serializes only the DOM).
          p: ({ children }) => <p style={{ margin: "0 0 0.5em" }}>{children}</p>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
