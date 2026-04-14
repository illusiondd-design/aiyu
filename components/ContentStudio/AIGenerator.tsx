'use client';

import { useState } from 'react';

interface Props {
  textInput: string;
  onGenerate: (generated: string) => void;
}

export default function AIGenerator({ textInput, onGenerate }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<string[]>([]);
  const isReady = typeof window !== "undefined";

  async function handleGenerate(type: 'caption' | 'hashtags' | 'cta' | 'full') {
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          input: textInput,
        }),
      });

      const data = await res.json();

      if (data.ok && data.result) {
        setGeneratedOptions(data.variations || [data.result]);
        onGenerate(data.result);
      } else {
        alert('AI-Generierung fehlgeschlagen!');
      }
    } catch (err) {
      console.error('AI Generate failed:', err);
      alert('Fehler bei AI-Generierung!');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        🤖 AI Generator
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
        <button
          onClick={() => handleGenerate('caption')}
          disabled={isGenerating}
          style={{
            background: '#0070f3',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            cursor: textInput ? 'pointer' : 'not-allowed',
            opacity: textInput ? 1 : 0.5,
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.2s',
          }}
        >
          ✍️ Caption
        </button>

        <button
          onClick={() => handleGenerate('hashtags')}
          disabled={Boolean(!textInput || isGenerating)}
          style={{
            background: '#51cf66',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            cursor: textInput ? 'pointer' : 'not-allowed',
            opacity: textInput ? 1 : 0.5,
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          #️⃣ Hashtags
        </button>

        <button
          onClick={() => handleGenerate('cta')}
          disabled={!textInput || isGenerating}
          style={{
            background: '#ffa500',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            cursor: textInput ? 'pointer' : 'not-allowed',
            opacity: textInput ? 1 : 0.5,
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          💬 CTA
        </button>

        <button
          onClick={() => handleGenerate('full')}
          disabled={!textInput || isGenerating}
          style={{
            background: '#9b59b6',
            color: 'white',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            cursor: textInput ? 'pointer' : 'not-allowed',
            opacity: textInput ? 1 : 0.5,
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          ✨ Komplett
        </button>
      </div>

      {isGenerating && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: '#0a0a0a',
          border: '1px solid #0070f3',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#0070f3',
        }}>
          🤖 AI generiert...
        </div>
      )}

      {generatedOptions.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
            Generierte Optionen:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {generatedOptions.map((option, i) => (
              <button
                key={i}
                onClick={() => onGenerate(option)}
                style={{
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '13px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0070f3';
                  e.currentTarget.style.background = '#0070f311';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.background = '#0a0a0a';
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
