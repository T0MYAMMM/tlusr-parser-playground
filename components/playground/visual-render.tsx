'use client';

import { motion } from 'framer-motion';
import { CalendarClock, User, Globe2, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Article } from '@/lib/types';

export function VisualRender({ article }: { article: Article }) {
  const date = article.publish_date ? new Date(article.publish_date) : null;

  return (
    <motion.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="prose-invert mx-auto max-w-2xl space-y-5 px-2 py-6"
    >
      {article.images[0]?.url && (
        <div className="relative overflow-hidden rounded-xl border border-white/[0.06]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.images[0].url}
            alt={article.images[0].alt ?? ''}
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />
        </div>
      )}

      <header className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {article.categories.slice(0, 3).map((c) => (
            <Badge key={c} variant="accent">{c}</Badge>
          ))}
        </div>
        <h1 className="text-2xl font-semibold leading-tight tracking-tight text-zinc-50">
          {article.title ?? 'Untitled article'}
        </h1>
        {article.subtitle && (
          <p className="text-base text-zinc-300">{article.subtitle}</p>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {article.author && (
          <span className="inline-flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> {article.author}
          </span>
        )}
        {date && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            {date.toUTCString()}
          </span>
        )}
        {article.language && (
          <span className="inline-flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5" />
            {article.language.toUpperCase()}
          </span>
        )}
        {article.source_domain && (
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            {article.source_domain}
          </span>
        )}
      </div>

      {article.summary && (
        <p className="rounded-md border-l-2 border-cyan-400/60 bg-cyan-400/5 px-4 py-2.5 text-sm italic text-zinc-200">
          {article.summary}
        </p>
      )}

      <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-200">
        {article.content ?? 'No body content was extracted.'}
      </div>

      {article.tags.length > 0 && (
        <footer className="flex flex-wrap gap-1.5 border-t border-white/[0.06] pt-4">
          {article.tags.map((t) => (
            <Badge key={t} variant="muted">#{t}</Badge>
          ))}
        </footer>
      )}
    </motion.article>
  );
}
