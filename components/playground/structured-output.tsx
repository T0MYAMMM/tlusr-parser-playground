'use client';

import { motion } from 'framer-motion';
import { ConfidenceBadge } from './confidence-badge';
import type { Article, ExtractionDiagnostics } from '@/lib/types';

interface Props {
  article: Article;
  diagnostics: ExtractionDiagnostics;
}

/**
 * Field-by-field rendering of the parsed Article with confidence badges
 * placed inline next to each key — the headline UX requested in the brief.
 */
export function StructuredOutput({ article, diagnostics }: Props) {
  const rows: Array<{ key: string; label: string; value: React.ReactNode; raw: unknown }> = [
    { key: 'title', label: 'Title', value: <Mono>{article.title ?? '—'}</Mono>, raw: article.title },
    { key: 'subtitle', label: 'Subtitle', value: <Mono>{article.subtitle ?? '—'}</Mono>, raw: article.subtitle },
    {
      key: 'summary',
      label: 'Summary',
      value: <span className="text-sm text-zinc-200">{article.summary ?? '—'}</span>,
      raw: article.summary,
    },
    {
      key: 'author',
      label: 'Author(s)',
      value: <Mono>{article.authors.join(', ') || article.author || '—'}</Mono>,
      raw: article.authors,
    },
    {
      key: 'publish_date',
      label: 'Publish date',
      value: <Mono>{article.publish_date ?? '—'}</Mono>,
      raw: article.publish_date,
    },
    {
      key: 'updated_date',
      label: 'Updated date',
      value: <Mono>{article.updated_date ?? '—'}</Mono>,
      raw: article.updated_date,
    },
    {
      key: 'language',
      label: 'Language',
      value: <Mono>{article.language ?? '—'}</Mono>,
      raw: article.language,
    },
    {
      key: 'categories',
      label: 'Categories',
      value: <Mono>{article.categories.join(', ') || '—'}</Mono>,
      raw: article.categories,
    },
    { key: 'tags', label: 'Tags', value: <Mono>{article.tags.join(', ') || '—'}</Mono>, raw: article.tags },
    {
      key: 'content',
      label: 'Content',
      value: (
        <span className="text-xs text-muted-foreground">
          {article.content
            ? `${article.content.length.toLocaleString()} chars · ${article.content
                .split(/\s+/)
                .filter(Boolean)
                .length.toLocaleString()} words`
            : '—'}
        </span>
      ),
      raw: article.content,
    },
  ];

  return (
    <div className="divide-y divide-white/[0.04]">
      {rows.map((row, i) => (
        <motion.div
          key={row.key}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.025 }}
          className="grid grid-cols-[140px_1fr_auto] items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02]"
        >
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            {row.label}
          </div>
          <div className="min-w-0 truncate">{row.value}</div>
          <ConfidenceBadge diagnostic={diagnostics.fields[row.key]} />
        </motion.div>
      ))}
    </div>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return (
    <span className="truncate font-mono text-xs text-zinc-100" title={typeof children === 'string' ? children : undefined}>
      {children}
    </span>
  );
}
