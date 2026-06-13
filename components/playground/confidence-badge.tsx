'use client';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { FieldDiagnostic } from '@/lib/types';

/**
 * Visual indicator of per-field extraction confidence.
 *
 * Green ≥ 0.75, Yellow ≥ 0.5, Red < 0.5. Tier is shown on hover so engineers
 * can tell at a glance *why* the parser felt the way it did.
 */
export function ConfidenceBadge({ diagnostic }: { diagnostic?: FieldDiagnostic }) {
  if (!diagnostic) return null;

  const { confidence, tier, strategy } = diagnostic;
  const level = confidence >= 0.75 ? 'high' : confidence >= 0.5 ? 'med' : 'low';

  const palette = {
    high: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300 shadow-[0_0_18px_-6px_rgba(16,185,129,0.7)]',
    med: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
    low: 'border-rose-400/40 bg-rose-400/10 text-rose-300',
  }[level];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[10px] leading-none',
            palette,
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              level === 'high' && 'bg-emerald-400',
              level === 'med' && 'bg-amber-400',
              level === 'low' && 'bg-rose-400',
            )}
          />
          {(confidence * 100).toFixed(0)}%
        </span>
      </TooltipTrigger>
      <TooltipContent side="right">
        <div className="space-y-0.5">
          <div>
            <span className="text-muted-foreground">tier · </span>
            <span className="text-foreground">{tier}</span>
          </div>
          <div>
            <span className="text-muted-foreground">strategy · </span>
            <span className="text-foreground">{strategy}</span>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
