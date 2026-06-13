import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata = { title: 'Documentation' };

const SECTIONS = [
  {
    slug: 'getting-started',
    title: 'Getting Started',
    description: 'Install the parser, wire up the FastAPI bridge, and run your first extraction.',
  },
  {
    slug: 'supported-domains',
    title: 'Supported News Domains',
    description: 'Domains where extraction quality is benchmarked and verified.',
  },
  {
    slug: 'schema-definition',
    title: 'Schema Definition',
    description: 'The Article and ExtractionDiagnostics contracts — field by field.',
  },
  {
    slug: 'error-handling',
    title: 'Error Handling',
    description: 'Exception hierarchy, retry semantics, and self-healing schema validation.',
  },
] as const;

export default function DocsIndex() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 pb-16 pt-8">
      <div className="mb-8 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-cyan-300" />
        <h1 className="text-3xl font-semibold tracking-tight">
          <span className="gradient-text">Documentation</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.slug} href={`/docs/${section.slug}` as any} className="group block">
            <Card className="transition-all hover:border-cyan-400/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="muted">/docs/{section.slug}</Badge>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                </div>
                <CardTitle className="mt-2 text-base">{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Documentation pages are sourced from <code className="font-mono">content/docs/{section.slug}.mdx</code>.
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
