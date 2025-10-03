import { LucideIcon } from 'lucide-react';

export type AdminCommand = {
  id: string;
  label: string;
  shortcut?: string;
  icon?: LucideIcon;
  href?: string;
  action?: () => void;
};
