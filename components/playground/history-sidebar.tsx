'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useHistory } from '@/lib/use-history';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (entry: { url: string; html: string }) => void;
}

export function HistorySidebar({ open, onOpenChange, onPick }: Props) {
  const { entries, remove, clear } = useHistory();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="fixed right-0 top-0 z-50 flex h-full w-[360px] flex-col border-l border-white/[0.08] bg-zinc-950/80 backdrop-blur-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-cyan-300" />
                <h2 className="text-sm font-semibold">Recent Runs</h2>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={clear}
                  disabled={entries.length === 0}
                  title="Clear all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onOpenChange(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </header>

            <ScrollArea className="flex-1">
              <ul className="space-y-1 p-2">
                {entries.length === 0 && (
                  <li className="px-3 py-8 text-center text-xs text-muted-foreground">
                    No runs yet. Parse a page to populate history.
                  </li>
                )}
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <button
                      onClick={() => {
                        onPick({ url: entry.url, html: entry.html });
                        onOpenChange(false);
                      }}
                      className={cn(
                        'group flex w-full items-start gap-2 rounded-md border border-transparent px-2.5 py-2 text-left transition-colors',
                        'hover:border-white/[0.06] hover:bg-white/[0.03]',
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs text-zinc-100">{entry.label}</div>
                        <div className="truncate font-mono text-[10px] text-muted-foreground">
                          {entry.url || '(local HTML)'}
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {new Date(entry.savedAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          remove(entry.id);
                        }}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-400" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
