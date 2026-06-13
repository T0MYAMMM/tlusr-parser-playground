'use client';

import { motion } from 'framer-motion';
import { Activity, Cpu, Database, Gauge, Hash, Layers, Sparkles } from 'lucide-react';
import { compactNumber, formatMs, cn } from '@/lib/utils';
import type { ExtractionDiagnostics } from '@/lib/types';

interface Props {
  diagnostics: ExtractionDiagnostics;
  domNodeCount?: number;
  bytesIn: number;
  bytesOut: number;
}

interface Metric {
  label: string;
  value: string;
  hint?: string;
  icon: typeof Activity;
  tone?: 'default' | 'accent' | 'success' | 'warning';
}

export function ExecutionMetrics({ diagnostics, domNodeCount, bytesIn, bytesOut }: Props) {
  const totalMs = Object.values(diagnostics.timings_ms).reduce((a, b) => a + b, 0);
  const sd = diagnostics.semantic_density ?? 0;

  const metrics: Metric[] = [
    { label: 'Parse Time', value: formatMs(totalMs), icon: Activity, tone: 'accent' },
    { label: 'DOM Nodes', value: compactNumber(domNodeCount ?? 0), icon: Cpu },
    {
      label: 'Confidence',
      value: `${(diagnostics.aggregate_confidence * 100).toFixed(0)}%`,
      icon: Gauge,
      tone: diagnostics.aggregate_confidence > 0.7 ? 'success' : 'warning',
    },
    {
      label: 'Semantic Density',
      value: sd.toFixed(2),
      hint: `${compactNumber(bytesIn)}B → ${compactNumber(bytesOut)}B`,
      icon: Layers,
      tone: sd > 0.6 ? 'success' : 'warning',
    },
    {
      label: 'Distiller',
      value: diagnostics.distiller_used ?? '—',
      icon: Database,
    },
    {
      label: 'LLM Calls',
      value: `${diagnostics.llm_calls}`,
      hint: diagnostics.llm_tokens ? `${compactNumber(diagnostics.llm_tokens)} tokens` : 'tier skipped',
      icon: Sparkles,
      tone: diagnostics.llm_calls > 0 ? 'accent' : 'default',
    },
    {
      label: 'Stages',
      value: `${Object.keys(diagnostics.timings_ms).length}`,
      icon: Hash,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-7">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25 }}
          className={cn(
            'glass flex items-start gap-2 px-3 py-2.5',
            m.tone === 'accent' && 'border-cyan-400/20',
            m.tone === 'success' && 'border-emerald-400/20',
            m.tone === 'warning' && 'border-amber-400/20',
          )}
        >
          <m.icon
            className={cn(
              'mt-0.5 h-3.5 w-3.5 shrink-0',
              m.tone === 'accent' && 'text-cyan-300',
              m.tone === 'success' && 'text-emerald-300',
              m.tone === 'warning' && 'text-amber-300',
              !m.tone && 'text-muted-foreground',
            )}
          />
          <div className="min-w-0">
            <div className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
              {m.label}
            </div>
            <div className="truncate font-mono text-xs text-zinc-100">{m.value}</div>
            {m.hint && (
              <div className="truncate text-[10px] text-muted-foreground">{m.hint}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
