import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

export function TagInput({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState('');

  const addTag = () => {
    if (!inputValue.trim()) return;
    onChange([...value, inputValue.trim()]);
    setInputValue('');
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map(tag => (
          <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
            {tag}
            <button type="button" onClick={() => onChange(value.filter(item => item !== tag))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addTag();
            }
          }}
        />
        <Button type="button" onClick={addTag}>
          Add
        </Button>
      </div>
    </div>
  );
}
