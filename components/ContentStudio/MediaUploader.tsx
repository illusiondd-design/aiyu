'use client';

import { useRef } from 'react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

export default function MediaUploader({ files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange([...files, ...newFiles]);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      onChange([...files, ...newFiles]);
    }
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '16px',
      padding: '24px',
    }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        🎬 Media Upload
      </h2>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #444',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          cursor: 'pointer',
          background: '#0a0a0a',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
        <div style={{ fontSize: '16px', marginBottom: '8px' }}>
          Drag & Drop oder Klicken zum Hochladen
        </div>
        <div style={{ fontSize: '12px', color: '#888' }}>
          Video oder Bilder (max 100MB)
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {files.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
            {files.length} Datei(en) hochgeladen:
          </div>
          {files.map((file, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px' }}>{file.name}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                style={{
                  background: '#ff6b6b22',
                  border: '1px solid #ff6b6b44',
                  color: '#ff6b6b',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Entfernen
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
