'use client';

import { Handle, Position, type NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';
import {
  Cpu,
  FileCode2,
  Filter,
  Hammer,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StageMeta } from '@/lib/pipeline-stages';

/** Per-tier visual treatment — stays inside the monochromatic+accent palette. */
const TIER_STYLE: Record<
  StageMeta['tier'],
  { ring: string; icon: typeof Cpu; chip: string; glow: string }
> = {
  input: { ring: 'border-zinc-500/40', icon: FileCode2, chip: 'text-zinc-300', glow: '' },
  parse: {
    ring: 'border-cyan-400/30',
    icon: Cpu,
    chip: 'text-cyan-300',
    glow: 'shadow-[0_0_36px_-12px_rgba(34,211,238,0.5)]',
  },
  distill: {
    ring: 'border-sky-400/30',
    icon: Filter,
    chip: 'text-sky-300',
    glow: 'shadow-[0_0_36px_-12px_rgba(56,189,248,0.5)]',
  },
  extract: {
    ring: 'border-emerald-400/30',
    icon: Hammer,
    chip: 'text-emerald-300',
    glow: 'shadow-[0_0_36px_-12px_rgba(16,185,129,0.5)]',
  },
  ai: {
    ring: 'border-fuchsia-400/30',
    icon: Sparkles,
    chip: 'text-fuchsia-300',
    glow: 'shadow-[0_0_36px_-12px_rgba(217,70,239,0.55)]',
  },
  output: {
    ring: 'border-emerald-400/40',
    icon: CheckCircle2,
    chip: 'text-emerald-300',
    glow: 'shadow-[0_0_36px_-12px_rgba(16,185,129,0.6)]',
  },
};

export interface StageNodeData {
  meta: StageMeta;
  selected?: boolean;
  index: number;
}

export function StageNode({ data, selected }: NodeProps<{ data: StageNodeData } & any>) {
  const meta = (data as unknown as StageNodeData).meta;
  const index = (data as unknown as StageNodeData).index;
  const style = TIER_STYLE[meta.tier];
  const Icon = style.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className={cn(
        'group relative w-[220px] rounded-xl border bg-zinc-950/70 px-3.5 py-3 backdrop-blur-xl transition-all',
        'border-white/[0.08]',
        style.ring,
        selected && cn('ring-2 ring-accent/60', style.glow),
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2.5 !w-2.5 !border-2 !border-zinc-900 !bg-cyan-300"
      />

      <div className="flex items-start gap-2.5">
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03]',
            style.chip,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-muted-foreground">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={cn('font-mono text-[10px] uppercase tracking-wider', style.chip)}>
              {meta.tier}
            </span>
          </div>
          <div className="mt-0.5 truncate text-[13px] font-semibold leading-tight text-zinc-100">
            {meta.label}
          </div>
          <div className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
            {meta.summary}
          </div>
        </div>
      </div>

      <div
        className={cn(
          'pointer-events-none absolute inset-x-3 -bottom-px h-px opacity-0 transition-opacity group-hover:opacity-100',
          'bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent',
        )}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="!h-2.5 !w-2.5 !border-2 !border-zinc-900 !bg-emerald-300"
      />
    </motion.div>
  );
}
