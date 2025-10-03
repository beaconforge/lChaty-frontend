import { KidsTileButton } from './KidsTileButton';
import type { KidsPreset } from '../../api/types';

export function KidsPromptGrid({ presets, onSelect }: { presets: KidsPreset[]; onSelect: (preset: KidsPreset) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {presets.map(preset => (
        <KidsTileButton
          key={preset.key}
          label={preset.label}
          description={preset.description}
          onClick={() => onSelect(preset)}
        />
      ))}
    </div>
  );
}
