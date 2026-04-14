'use client';

interface Props {
  onClick: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export default function GenerateButton({ onClick, isGenerating, disabled }: Props) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: '2px solid #764ba2',
      borderRadius: '16px',
      padding: '4px',
    }}>
      <button
        onClick={onClick}
        disabled={disabled || isGenerating}
        style={{
          width: '100%',
          background: disabled ? '#333' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '12px',
          padding: '24px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.3s',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>
          {isGenerating ? '⚡' : '🚀'}
        </div>
        <div style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '4px',
        }}>
          {isGenerating ? 'Generiert...' : 'Content generieren'}
        </div>
        <div style={{ fontSize: '14px', color: '#ddd' }}>
          {isGenerating
            ? 'AI erstellt deine Multi-Platform Posts...'
            : 'Klicke um AI-powered Content zu erstellen'
          }
        </div>
      </button>
    </div>
  );
}
