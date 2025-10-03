import Papa from 'papaparse';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface Props<T> {
  filename: string;
  rows: T[];
}

export function CSVExport<T>({ filename, rows }: Props<T>) {
  const handleExport = () => {
    const csv = Papa.unparse(rows as unknown as Record<string, unknown>[]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={!rows.length}>
      <Download className="mr-2 h-4 w-4" /> Export CSV
    </Button>
  );
}
