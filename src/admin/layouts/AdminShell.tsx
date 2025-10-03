import { PropsWithChildren, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';
import { Breadcrumbs } from './Breadcrumbs';
import { CommandPalette } from './CommandPalette';
import { useUIPreferencesStore } from '../state/useUIPreferences';
import { useCommandPaletteStore } from '../state/useCommandPalette';
import { sidebarRoutes } from '../routes';
import { cn } from '../lib/utils';
import * as Icons from 'lucide-react';

export function AdminShell({ children }: PropsWithChildren) {
  const collapsed = useUIPreferencesStore(state => state.sidebarCollapsed);
  const setCommands = useCommandPaletteStore(state => state.setCommands);

  useEffect(() => {
    const commands = sidebarRoutes.map(route => ({
      id: route.path || 'dashboard',
      label: route.label,
      icon: (Icons as any)[route.icon],
      href: `/${route.path}`,
    }));
    setCommands(commands);
  }, [setCommands]);

  return (
    <div className="min-h-screen bg-muted/20">
      <CommandPalette />
      <TopBar />
      <div className="flex">
        <SidebarNav />
        <main
          className={cn(
            'flex-1 min-h-[calc(100vh-64px)] px-6 pb-10 pt-6 transition-all duration-200',
            collapsed ? 'md:ml-16' : 'md:ml-64',
          )}
        >
          <Breadcrumbs />
          <div className="mt-4">
            {children ?? <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
}
