import { PropsWithChildren } from 'react';
import { cn } from '../../lib/utils';

const TableRoot = ({ className, ...props }: PropsWithChildren<{ className?: string }>) => (
  <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
);

const TableHeader = ({ className, ...props }: PropsWithChildren<{ className?: string }>) => (
  <thead className={cn('[&_tr]:border-b bg-muted/30', className)} {...props} />
);

const TableBody = ({ className, ...props }: PropsWithChildren<{ className?: string }>) => (
  <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />
);

const TableRow = ({ className, ...props }: PropsWithChildren<{ className?: string }>) => (
  <tr className={cn('border-b transition-colors hover:bg-muted/50', className)} {...props} />
);

const TableHeadCell = ({ className, ...props }: PropsWithChildren<{ className?: string }>) => (
  <th
    className={cn('sticky top-0 z-10 h-11 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground backdrop-blur', className)}
    {...props}
  />
);

const TableCell = ({ className, ...props }: PropsWithChildren<{ className?: string }>) => (
  <td className={cn('p-3 align-middle', className)} {...props} />
);

export const Table = Object.assign(TableRoot, {
  Head: TableHeader,
  Body: TableBody,
  Row: TableRow,
  HeadCell: TableHeadCell,
  Cell: TableCell,
});
