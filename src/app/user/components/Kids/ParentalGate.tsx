import { useMemo, useState } from 'react';

function generatePuzzle() {
  const a = Math.ceil(Math.random() * 5) + 1;
  const b = Math.ceil(Math.random() * 5) + 1;
  return { question: `${a} + ${b} = ?`, answer: a + b };
}

export function ParentalGate({ onUnlock }: { onUnlock: () => void }) {
  const puzzle = useMemo(generatePuzzle, []);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  return (
    <div className="rounded-3xl border-4 border-primary/40 bg-background p-6 text-center shadow-lg">
      <h3 className="text-xl font-bold text-primary">Parent check</h3>
      <p className="mt-2 text-sm text-muted-foreground">Answer the puzzle to continue.</p>
      <p className="mt-4 text-2xl font-semibold">{puzzle.question}</p>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={event => setValue(event.target.value)}
        className="mt-4 w-24 rounded-lg border border-input px-3 py-2 text-center text-lg"
        aria-label="Parent puzzle answer"
      />
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (Number(value) === puzzle.answer) {
              onUnlock();
            } else {
              setError('Oops! Try again.');
            }
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
