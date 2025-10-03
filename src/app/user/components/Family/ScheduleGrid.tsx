const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function ScheduleGrid({ value }: { value: Record<string, string> }) {
  return (
    <table className="w-full table-fixed border-collapse text-left text-sm">
      <thead>
        <tr>
          {DAYS.map(day => (
            <th key={day} className="border-b p-2 text-muted-foreground">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {DAYS.map(day => (
            <td key={day} className="border-b p-2">
              {value[day] ?? 'Free play'}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
