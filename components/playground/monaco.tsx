'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

/**
 * Dynamically imported Monaco — keeps the editor and its worker out of the
 * server bundle. The placeholder maintains layout so split panes don't jump.
 */
export const Monaco = dynamic(() => import('@monaco-editor/react').then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="ml-2 text-xs">Loading editor…</span>
    </div>
  ),
});

/**
 * Shared Monaco options. We theme the editor with the matching zinc palette
 * via `monacoTheme` defined here as a "tlusr" theme.
 */
export const MONACO_OPTIONS = {
  minimap: { enabled: false },
  fontFamily: 'var(--font-mono), ui-monospace, SFMono-Regular',
  fontSize: 13,
  fontLigatures: true,
  lineNumbers: 'on' as const,
  renderLineHighlight: 'gutter' as const,
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  scrollbar: { vertical: 'auto' as const, horizontal: 'hidden' as const },
  wordWrap: 'on' as const,
  padding: { top: 12, bottom: 12 },
  automaticLayout: true,
  tabSize: 2,
};

export function defineTlusrTheme(monaco: typeof import('monaco-editor')) {
  monaco.editor.defineTheme('tlusr', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'tag', foreground: '67E8F9' },
      { token: 'attribute.name', foreground: 'A5F3FC' },
      { token: 'attribute.value', foreground: '6EE7B7' },
      { token: 'string', foreground: '6EE7B7' },
      { token: 'number', foreground: 'F0ABFC' },
      { token: 'comment', foreground: '52525B', fontStyle: 'italic' },
      { token: 'delimiter', foreground: '71717A' },
    ],
    colors: {
      'editor.background': '#0a0a0c',
      'editor.foreground': '#e4e4e7',
      'editorLineNumber.foreground': '#3f3f46',
      'editorLineNumber.activeForeground': '#a1a1aa',
      'editor.selectionBackground': '#0e7490AA',
      'editorCursor.foreground': '#67E8F9',
      'editor.lineHighlightBackground': '#18181b',
      'editorIndentGuide.background': '#1f1f23',
      'editorIndentGuide.activeBackground': '#3f3f46',
      'scrollbar.shadow': '#00000000',
    },
  });
}
