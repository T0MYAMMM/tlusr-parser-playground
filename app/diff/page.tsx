import { GitCompare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Diff' };

export default function DiffPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-8">
      <div className="mb-6 flex items-center gap-2">
        <GitCompare className="h-4 w-4 text-cyan-300" />
        <Badge variant="muted">Regression testing</Badge>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        <span className="gradient-text">Diff Viewer</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Compare two parser outputs side-by-side. Use this to verify that a parser-rule change
        doesn't regress confidence on a known-good fixture.
      </p>
      <div className="glass mt-8 grid grid-cols-2 gap-px overflow-hidden">
        <div className="bg-zinc-950/40 p-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Baseline
          </div>
          <pre className="mt-3 max-h-[420px] overflow-auto font-mono text-[11px] leading-relaxed text-zinc-300">
            {`{
  "title": "SpaceX Lands Heavy Booster",
  "publish_date": "2026-05-16T18:30:00Z",
  "author": "Jane Reporter"
}`}
          </pre>
        </div>
        <div className="bg-zinc-950/40 p-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Candidate
          </div>
          <pre className="mt-3 max-h-[420px] overflow-auto font-mono text-[11px] leading-relaxed text-zinc-300">
            {`{
  "title": "SpaceX Lands Heavy Booster on Drone Ship",
  "publish_date": "2026-05-16T18:30:00Z",
  "author": "Jane Reporter"
}`}
          </pre>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Stub UI — wire to the <code className="font-mono">diff</code> package and the JSON output
        of two playground runs to enable real comparison.
      </p>
    </div>
  );
}
