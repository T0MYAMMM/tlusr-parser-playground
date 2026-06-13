import { NextResponse } from 'next/server';
import { z } from 'zod';

import { mockParse } from '@/lib/mock-parser';
import type { ParseResponse } from '@/lib/types';

const PayloadSchema = z.object({
  url: z.string().url(),
  html: z.string().min(1, 'html is required'),
  rendered_html: z.string().optional(),
  crawl_timestamp: z.string().datetime().optional(),
});

export const runtime = 'nodejs';

/**
 * `/api/parse` — the single endpoint the playground calls.
 *
 * - When `PARSER_API_URL` is set, forwards to the FastAPI backend that wraps
 *   the `tlusr_parser` Python package.
 * - Otherwise falls back to a deterministic in-process mock so the UI is
 *   functional without infrastructure.
 */
export async function POST(req: Request) {
  let body: z.infer<typeof PayloadSchema>;
  try {
    body = PayloadSchema.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_request', detail: (err as Error).message },
      { status: 400 },
    );
  }

  const upstream = process.env.PARSER_API_URL;
  if (upstream) {
    try {
      const r = await fetch(`${upstream.replace(/\/+$/, '')}/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        // Don't cache parsing — each call is unique.
        cache: 'no-store',
      });
      if (!r.ok) {
        const detail = await r.text().catch(() => '');
        return NextResponse.json(
          { error: 'upstream_error', status: r.status, detail },
          { status: 502 },
        );
      }
      const data = (await r.json()) as ParseResponse;
      return NextResponse.json(data);
    } catch (err) {
      return NextResponse.json(
        { error: 'upstream_unreachable', detail: (err as Error).message },
        { status: 502 },
      );
    }
  }

  // No backend configured → respond with the mock so the UI works end-to-end.
  return NextResponse.json(mockParse(body));
}
