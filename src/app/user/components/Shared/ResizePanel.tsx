import { ReactNode, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

export function ResizePanel({
  children,
  initialSize = 320,
  minSize = 240,
  maxSize = 560,
  orientation = 'horizontal',
  className,
}: {
  children: ReactNode;
  initialSize?: number;
  minSize?: number;
  maxSize?: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  const [size, setSize] = useState(initialSize);
  const dragging = useRef(false);

  return (
    <div
      className={cn('relative flex', orientation === 'horizontal' ? 'flex-col' : 'flex-row', className)}
      style={orientation === 'horizontal' ? { height: size } : { width: size }}
    >
      <div className="flex-1 overflow-hidden">{children}</div>
      <div
        role="separator"
        aria-orientation={orientation}
        tabIndex={0}
        className={cn(
          'absolute flex cursor-grab items-center justify-center bg-transparent transition',
          orientation === 'horizontal'
            ? 'inset-x-0 bottom-0 h-2'
            : 'inset-y-0 right-0 w-2',
        )}
        onMouseDown={event => {
          event.preventDefault();
          dragging.current = true;
        }}
        onMouseUp={() => {
          dragging.current = false;
        }}
        onMouseMove={event => {
          if (!dragging.current) return;
          if (orientation === 'horizontal') {
            const next = Math.min(Math.max(minSize, size + event.movementY), maxSize);
            setSize(next);
          } else {
            const next = Math.min(Math.max(minSize, size + event.movementX), maxSize);
            setSize(next);
          }
        }}
      />
    </div>
  );
}
