'use client';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function TextInput({ value, onChange }: Props) {
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        ✍️ Master Prompt
      </h2>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Beschreibe deinen Content oder gib einen Prompt ein...

Beispiele:
- 'Ölwechsel-Tutorial für Wintervorbereitung'
- 'Vorher-Nachher Lackierung BMW 3er'
- 'Tipps für Reifenwechsel - Safety First'

Der AI-Generator erstellt daraus plattform-optimierte Captions, Hashtags und CTAs!"
        style={{
          width: '100%',
          minHeight: '200px',
          background: '#0a0a0a',
          border: '1px solid #333',
          borderRadius: '12px',
          padding: '16px',
          color: '#fff',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
      />

      <div style={{
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: '12px', color: '#888' }}>
          {value.length} Zeichen
        </div>

        {value.length > 500 && (
          <div style={{ fontSize: '12px', color: '#51cf66' }}>
            ✅ Genug Info für gute Generierung
          </div>
        )}
      </div>
    </div>
  );
}
