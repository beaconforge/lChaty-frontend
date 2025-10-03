import { ShieldCheck, Search } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { ColorThemeToggle } from '../components/ColorThemeToggle';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCommandPaletteStore } from '../state/useCommandPalette';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

export function TopBar() {
  const { user } = useAuth();
  const toggle = useCommandPaletteStore(state => state.toggle);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur">
      <div className="hidden items-center gap-3 md:flex">
        <Button variant="outline" size="sm" onClick={() => toggle(true)}>
          <Search className="mr-2 h-4 w-4" />
          Quick actions (Ctrl + K)
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center px-4 md:justify-start md:px-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users, orgs, tickets..." className="pl-9" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ColorThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden text-sm font-medium md:inline">{user?.username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => (window.location.href = '/api/auth/logout')}>
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
