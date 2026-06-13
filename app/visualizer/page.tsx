import { PipelineVisualizer } from '@/components/visualizer/pipeline-visualizer';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Pipeline Visualizer' };

export default function VisualizerPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-12 pt-6">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="accent">Interactive</Badge>
            <Badge variant="muted">Live mirror of DefaultPipeline</Badge>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            <span className="gradient-text">Execution Flow</span>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Each node maps 1:1 to a stage in <code className="font-mono text-cyan-300">DefaultPipeline._run_stages</code>.
            Click any node to open the side panel — it shows the heuristics, tags, and module
            paths used at that step.
          </p>
        </div>
      </header>

      <PipelineVisualizer />
    </div>
  );
}
