import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchKidsPresets, sendKidsPrompt } from '../../api/kids';
import { useKidsStore } from '../../state/useKidsStore';
import { KidsPromptGrid } from '../../components/Kids/KidsPromptGrid';
import { KidsVoiceToggle } from '../../components/Kids/KidsVoiceToggle';
import { ParentalGate } from '../../components/Kids/ParentalGate';
import { EmptyState } from '../../components/Shared/EmptyState';
import { Markdown } from '../../components/Shared/Markdown';

const fallbackPresets = [
  {
    key: 'story',
    label: 'Tell me a story',
    description: 'A cozy bedtime adventure',
    prompt: 'Tell me a 5-minute bedtime story about a brave cat. Keep it kind and age-appropriate.',
  },
  {
    key: 'homework',
    label: 'Help with homework',
    description: 'Explain homework in simple steps',
    prompt: 'Help me understand my homework in a simple way.',
  },
  {
    key: 'jokes',
    label: 'Jokes & Riddles',
    description: 'Silly fun for kids',
    prompt: 'Tell me three kid-friendly jokes with emojis.',
  },
];

export default function KidsPage() {
  const { data } = useQuery({ queryKey: ['kids-presets'], queryFn: () => fetchKidsPresets(), staleTime: 5 * 60 * 1000 });
  const { presets, setPresets, voiceEnabled, setVoiceEnabled, markUsed, lastUsed } = useKidsStore();
  const [latestResponse, setLatestResponse] = useState<string>('');
  const [parentUnlocked, setParentUnlocked] = useState(false);

  useEffect(() => {
    if (data?.length) {
      setPresets(data);
    } else if (!presets.length) {
      setPresets(fallbackPresets);
    }
  }, [data, presets.length, setPresets]);

  const handleSelect = async (preset: (typeof fallbackPresets)[number]) => {
    setLatestResponse('');
    markUsed(preset.key);
    try {
      const response = await sendKidsPrompt({ presetKey: preset.key });
      setLatestResponse(response.content);
    } catch (error) {
      setLatestResponse('Unable to contact the kids assistant right now. Please try again later.');
    }
  };

  if (!parentUnlocked) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-6"
        style={{ background: 'linear-gradient(135deg, #fde68a, #fbcfe8, #bfdbfe)' }}
      >
        <ParentalGate onUnlock={() => setParentUnlocked(true)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'linear-gradient(180deg, #fef3c7, #ffffff, #bfdbfe)' }}>
      <header className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-white/80 p-6 text-center shadow-xl md:flex-row md:text-left">
        <div>
          <h1 className="text-4xl font-black text-primary">Kids chat playground</h1>
          <p className="mt-2 text-lg text-muted-foreground">Tap a card to start a magical conversation.</p>
        </div>
        <KidsVoiceToggle enabled={voiceEnabled} onChange={setVoiceEnabled} />
      </header>
      <main className="mx-auto mt-8 max-w-6xl space-y-8">
        <KidsPromptGrid presets={presets.length ? presets : fallbackPresets} onSelect={handleSelect} />
        <section className="rounded-3xl bg-white/90 p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-primary">Assistant replies</h2>
          {latestResponse ? (
            <Markdown content={latestResponse} className="mt-4 text-lg" />
          ) : (
            <EmptyState title="Pick a tile to begin" description="Responses will appear here with big friendly text." />
          )}
          {lastUsed ? (
            <p className="mt-4 text-sm text-muted-foreground">Last activity: {new Date().toLocaleTimeString()}</p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
