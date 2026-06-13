'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { StageMeta } from '@/lib/pipeline-stages';

interface Props {
  stage: StageMeta | null;
  onClose: () => void;
}

export function StageDetailsPanel({ stage, onClose }: Props) {
  return (
    <AnimatePresence>
      {stage && (
        <motion.aside
          key={stage.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 36 }}
          className="absolute right-3 top-3 z-30 flex max-h-[calc(100%-1.5rem)] w-[380px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-zinc-950/85 backdrop-blur-2xl shadow-[0_30px_60px_-20px_rgba(0,0,0,0.65)]"
        >
          <header className="flex items-start justify-between gap-3 border-b border-white/[0.06] px-5 py-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="accent">{stage.tier}</Badge>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Stage
                </span>
              </div>
              <h3 className="mt-1.5 text-base font-semibold leading-tight text-zinc-50">
                {stage.label}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{stage.summary}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4 text-sm">
            <section>
              <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                What it does
              </h4>
              <p className="text-[13px] leading-relaxed text-zinc-200">{stage.description}</p>
            </section>

            <Separator />

            <section>
              <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Under the hood
              </h4>
              <ul className="space-y-2">
                {stage.techniques.map((t) => (
                  <li
                    key={t.name}
                    className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                  >
                    <div className="font-mono text-[11px] text-cyan-200">{t.name}</div>
                    <div className="mt-0.5 text-xs text-zinc-300">{t.detail}</div>
                  </li>
                ))}
              </ul>
            </section>

            <Separator />

            <section>
              <h4 className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Source
              </h4>
              <code className="block rounded-md border border-white/[0.06] bg-zinc-900/60 px-2.5 py-1.5 font-mono text-[11px] text-emerald-300">
                {stage.source}
              </code>
            </section>
          </div>

          <footer className="border-t border-white/[0.06] px-5 py-3">
            <Button asChild variant="outline" size="sm" className="w-full">
              <a
                href={`https://github.com/t0myammm/tlusr-article-parsing-intelligence/blob/main/${stage.source}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="h-3 w-3" /> Open source
              </a>
            </Button>
          </footer>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
