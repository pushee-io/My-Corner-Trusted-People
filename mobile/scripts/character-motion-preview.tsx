// Test-only browser mount of the production animation component; never an Expo route.
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AICharacterPresentation, type AIMotionState } from '../src/components/AICharacterPresentation';
import { aiCharacters } from '../src/lib/ai-characters';
function Preview() {
  const [state, setState] = useState<AIMotionState>('idle');
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', background: '#FAFBF9', padding: 16, color: '#102A43' }}>
      <h2>My Corner · Character motion</h2>
      <p>Production component · browser QA fixture</p>
      <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {(['idle', 'listening', 'thinking', 'answer', 'happy', 'surprised'] as const).map((value) => (
          <button
            key={value}
            onClick={() => setState(value)}
            style={{
              padding: 10,
              borderRadius: 10,
              background: state === value ? '#0E6B50' : 'white',
              color: state === value ? 'white' : '#102A43',
            }}
          >
            {value}
          </button>
        ))}
      </nav>
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        {aiCharacters.map((character) => (
          <article
            key={character.id}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          >
            <AICharacterPresentation character={character} state={state} size={164} />
            <strong>{character.displayName}</strong>
          </article>
        ))}
      </section>
      <p>{state} · Independent hand/arm, expression frames, no audio.</p>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Preview />);
