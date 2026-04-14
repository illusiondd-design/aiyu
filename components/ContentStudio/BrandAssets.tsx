'use client';

import { useRef } from 'react';

interface Props {
  assets: any;
  onChange: (assets: any) => void;
}

export default function BrandAssets({ assets, onChange }: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null);

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        onChange({
          ...assets,
          logo: event.target?.result,
          logoFile: file,
        });
      };
      
      reader.readAsDataURL(file);
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
        🎨 Brand Assets
      </h2>

      {/* LOGO */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          Logo
        </div>
        
        {assets?.logo ? (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <img 
              src={assets.logo} 
              alt="Logo" 
              style={{
                width: '80px',
                height: '80px',
                objectFit: 'contain',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            <button
              onClick={() => onChange({ ...assets, logo: null, logoFile: null })}
              style={{
                background: '#ff6b6b22',
                border: '1px solid #ff6b6b44',
                color: '#ff6b6b',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Entfernen
            </button>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            style={{
              background: '#0a0a0a',
              border: '2px dashed #444',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              width: '100%',
              color: '#888',
            }}
          >
            📁 Logo hochladen
          </button>
        )}

        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* BRAND COLORS */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          Brand Farben
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="color"
            value={assets?.primaryColor || '#0070f3'}
            onChange={(e) => onChange({ ...assets, primaryColor: e.target.value })}
            style={{
              width: '60px',
              height: '40px',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          />
          <input
            type="color"
            value={assets?.secondaryColor || '#51cf66'}
            onChange={(e) => onChange({ ...assets, secondaryColor: e.target.value })}
            style={{
              width: '60px',
              height: '40px',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {/* FONT */}
      <div>
        <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
          Font Style
        </div>
        <select
          value={assets?.fontStyle || 'modern'}
          onChange={(e) => onChange({ ...assets, fontStyle: e.target.value })}
          style={{
            width: '100%',
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '12px',
            color: '#fff',
            fontSize: '14px',
          }}
        >
          <option value="modern">Modern</option>
          <option value="classic">Classic</option>
          <option value="playful">Playful</option>
          <option value="bold">Bold</option>
        </select>
      </div>
    </div>
  );
}
