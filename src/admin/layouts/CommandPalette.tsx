import { useEffect } from 'react';
import { useCommandPaletteStore } from '../state/useCommandPalette';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

export function CommandPalette() {
  const { open, toggle, commands } = useCommandPaletteStore();

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        toggle(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogContent className="max-w-xl p-0">
        <div className="border-b p-4">
          <Input placeholder="Search actions" autoFocus />
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {commands.length ? (
            commands.map(command => (
              <Button
                key={command.id}
                variant="ghost"
                className="flex w-full justify-between"
                onClick={() => {
                  if (command.href) {
                    window.location.href = command.href;
                  }
                  command.action?.();
                  toggle(false);
                }}
              >
                <span>{command.label}</span>
                {command.shortcut ? <span className="text-xs text-muted-foreground">{command.shortcut}</span> : null}
              </Button>
            ))
          ) : (
            <div className="p-6 text-sm text-muted-foreground">No commands available</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
