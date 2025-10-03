import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const items = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    return { segment, path };
  });

  return (
    <nav className="flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-foreground">
        Dashboard
      </Link>
      {items.map(item => (
        <span key={item.path} className="flex items-center gap-2">
          <ChevronRight className="h-3 w-3" />
          <Link to={item.path} className="capitalize hover:text-foreground">
            {item.segment.replace(/-/g, ' ')}
          </Link>
        </span>
      ))}
    </nav>
  );
}
