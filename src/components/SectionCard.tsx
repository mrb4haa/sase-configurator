import { CopyButton } from './CopyButton';

interface SectionCardProps {
  title: string;
  description: string;
  content: string;
  className?: string;
  highlight?: boolean;
}

export function SectionCard({ title, description, content, className, highlight }: SectionCardProps) {
  return (
    <section
      className={`flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-card transition-all ${
        highlight ? 'ring-2 ring-primary/60' : ''
      } ${className ?? ''}`}
    >
      <header className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-heading text-xl font-semibold text-text-base">{title}</h3>
          <p className="mt-1 text-sm text-text-muted">{description}</p>
        </div>
        <CopyButton value={content} />
      </header>
      <div className="overflow-hidden rounded-lg border border-border bg-[#f4f4f4]">
        <pre className="max-h-[360px] overflow-auto p-4 text-sm leading-relaxed text-text-base">
          <code className="font-mono whitespace-pre text-xs sm:text-sm">{content}</code>
        </pre>
      </div>
    </section>
  );
}
