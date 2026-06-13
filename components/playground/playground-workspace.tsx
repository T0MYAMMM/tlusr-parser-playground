'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Braces,
  Eye,
  History as HistoryIcon,
  Link2,
  Play,
  Loader2,
  Workflow,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { Monaco, MONACO_OPTIONS, defineTlusrTheme } from './monaco';
import { StructuredOutput } from './structured-output';
import { VisualRender } from './visual-render';
import { ExecutionMetrics } from './execution-metrics';
import { HistorySidebar } from './history-sidebar';

import { useHistory } from '@/lib/use-history';
import type { ParseResponse } from '@/lib/types';

const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>SpaceX Lands Heavy Booster on Drone Ship | Example News</title>
  <meta name="description" content="A milestone test flight: SpaceX recovered its Super Heavy booster on an autonomous drone ship for the first time.">
  <meta name="author" content="Jane Reporter">
  <meta property="og:title" content="SpaceX Lands Heavy Booster on Drone Ship">
  <meta property="article:published_time" content="2026-05-16T18:30:00Z">
  <link rel="canonical" href="https://example.com/news/sample-article">
  <script type="application/ld+json">
  {"@context":"https://schema.org","@type":"NewsArticle",
   "headline":"SpaceX Lands Heavy Booster on Drone Ship",
   "datePublished":"2026-05-16T18:30:00Z",
   "author":{"@type":"Person","name":"Jane Reporter"},
   "articleSection":"Space","keywords":"spacex,super heavy,reusable rockets"}
  </script>
</head>
<body>
  <article>
    <h1>SpaceX Lands Heavy Booster on Drone Ship</h1>
    <p class="byline">By <span class="author">Jane Reporter</span> · <time datetime="2026-05-16T18:30:00Z">May 16, 2026</time></p>
    <p>SpaceX completed a milestone test flight today, successfully recovering its Super Heavy booster on an autonomous drone ship in the Atlantic Ocean.</p>
    <p>The recovery marks a significant step toward full reusability of the company's flagship launch system.</p>
  </article>
</body>
</html>`;

const DEFAULT_URL = 'https://example.com/news/sample-article';

export function PlaygroundWorkspace() {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [html, setHtml] = useState(DEFAULT_HTML);
  const [result, setResult] = useState<ParseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { push: pushHistory } = useHistory();
  const lastParseAt = useRef<number>(0);

  const parse = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          html,
          crawl_timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        throw new Error(`Parser returned HTTP ${res.status}`);
      }
      const data = (await res.json()) as ParseResponse;
      setResult(data);
      lastParseAt.current = performance.now() - start;
      pushHistory({
        label: data.article.title ?? 'Untitled run',
        url,
        html,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error.');
    } finally {
      setLoading(false);
    }
  }, [html, url, pushHistory]);

  // Run once on mount so the user immediately sees a populated view.
  useEffect(() => {
    void parse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jsonText = useMemo(
    () => (result ? JSON.stringify(result.article, null, 2) : '// run the parser to see output'),
    [result],
  );

  const bytesIn = html.length;
  const bytesOut = jsonText.length;

  return (
    <div className="mx-auto max-w-[1440px] px-6 pb-12 pt-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="gradient-text">Parser Playground</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste raw HTML or simulate a fetch. The cascade runs metadata → heuristic → semantic →
            optionally LLM.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex w-[420px] max-w-full items-center">
            <Link2 className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="pl-9 pr-3 font-mono text-xs"
            />
          </div>
          <Button onClick={() => parse()} disabled={loading} className="min-w-[112px]">
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Parsing
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5" /> Run Parser
              </>
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setHistoryOpen(true)}>
            <HistoryIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Split-pane workspace */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* INPUT */}
        <Card className="flex h-[640px] flex-col">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-3.5 w-3.5 text-cyan-300" /> Raw HTML
            </CardTitle>
            <Badge variant="muted" className="font-mono">
              {(bytesIn / 1024).toFixed(1)} KB
            </Badge>
          </CardHeader>
          <Separator />
          <div className="relative flex-1 overflow-hidden">
            <Monaco
              defaultLanguage="html"
              theme="tlusr"
              value={html}
              onChange={(v) => setHtml(v ?? '')}
              beforeMount={(monaco) => defineTlusrTheme(monaco)}
              options={MONACO_OPTIONS}
            />
          </div>
          <CardFooter>
            <span className="text-[10px] uppercase tracking-wider">Input · HTML</span>
            <span className="ml-auto font-mono">
              Lines · {html.split('\n').length.toLocaleString()}
            </span>
          </CardFooter>
        </Card>

        {/* OUTPUT */}
        <Card className="flex h-[640px] flex-col">
          <Tabs defaultValue="json" className="flex h-full flex-col">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Braces className="h-3.5 w-3.5 text-emerald-300" /> Parsed Output
              </CardTitle>
              <TabsList>
                <TabsTrigger value="json">
                  <Braces className="mr-1.5 h-3 w-3" /> JSON
                </TabsTrigger>
                <TabsTrigger value="fields">
                  <Workflow className="mr-1.5 h-3 w-3" /> Fields
                </TabsTrigger>
                <TabsTrigger value="render">
                  <Eye className="mr-1.5 h-3 w-3" /> Render
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            <Separator />

            <TabsContent value="json" className="m-0 flex-1 overflow-hidden">
              <Monaco
                defaultLanguage="json"
                theme="tlusr"
                value={jsonText}
                beforeMount={(monaco) => defineTlusrTheme(monaco)}
                options={{ ...MONACO_OPTIONS, readOnly: true }}
              />
            </TabsContent>

            <TabsContent value="fields" className="m-0 flex-1 overflow-y-auto">
              {result ? (
                <StructuredOutput
                  article={result.article}
                  diagnostics={result.diagnostics}
                />
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="render" className="m-0 flex-1 overflow-y-auto">
              {result ? <VisualRender article={result.article} /> : <EmptyState />}
            </TabsContent>

            <CardFooter>
              <span className="text-[10px] uppercase tracking-wider">Output · JSON / Fields / Render</span>
              <span className="ml-auto font-mono">{(bytesOut / 1024).toFixed(1)} KB</span>
            </CardFooter>
          </Tabs>
        </Card>
      </div>

      {/* Metrics strip */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <ExecutionMetrics
                diagnostics={result.diagnostics}
                domNodeCount={result.dom_node_count}
                bytesIn={bytesIn}
                bytesOut={bytesOut}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-50 flex max-w-md items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-xs text-rose-200 shadow-xl backdrop-blur-xl"
          >
            <AlertCircle className="mt-0.5 h-3.5 w-3.5" />
            <div>
              <div className="font-semibold">Parser request failed</div>
              <div className="mt-0.5 font-mono text-rose-300/80">{error}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HistorySidebar
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        onPick={({ url: u, html: h }) => {
          setUrl(u);
          setHtml(h);
        }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center px-6 py-12 text-center text-xs text-muted-foreground">
      Run the parser to populate this view.
    </div>
  );
}
