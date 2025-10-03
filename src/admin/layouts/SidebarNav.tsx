import { NavLink, useLocation } from 'react-router-dom';
import { sidebarRoutes } from '../routes';
import * as Icons from 'lucide-react';
import { useUIPreferencesStore } from '../state/useUIPreferences';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export function SidebarNav() {
  const location = useLocation();
  const collapsed = useUIPreferencesStore(state => state.sidebarCollapsed);
  const toggleSidebar = useUIPreferencesStore(state => state.toggleSidebar);

  return (
    <aside
      className={cn(
        'fixed inset-y-0 z-40 hidden h-full border-r bg-background/95 shadow-sm transition-all duration-200 md:flex md:flex-col',
        collapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <span className="text-lg font-semibold">{collapsed ? 'LC' : 'lChaty Admin'}</span>
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Icons.ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {sidebarRoutes.map(route => {
          const Icon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[
            route.icon as keyof typeof Icons
          ];
          const isActive = location.pathname === `/${route.path}` || location.pathname.startsWith(`/${route.path}/`);
          return (
            <NavLink
              key={route.path}
              to={`/${route.path}`}
              className={({ isActive: navActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  (navActive || isActive) && 'bg-accent text-accent-foreground',
                  collapsed && 'justify-center px-0',
                )
              }
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {!collapsed ? <span>{route.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
