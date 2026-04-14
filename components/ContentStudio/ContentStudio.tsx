'use client';

import { useState } from 'react';
import PlatformSelector from './PlatformSelector';
import FormatSelector from './FormatSelector';
import MediaUploader from './MediaUploader';
import TextInput from './TextInput';
import AIGenerator from './AIGenerator';
import GenerateButton from './GenerateButton';
import PreviewPanel from './PreviewPanel';

export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin';
export type Format = 'reel' | 'post' | 'story' | 'short' | 'video';

type UploadResponse = {
  success?: boolean;
  error?: string;
  previewUrl?: string;
  downloadUrl?: string;
  fileName?: string;
  fileType?: string;
};

export default function ContentStudio() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram']);
  const [selectedFormat, setSelectedFormat] = useState<Format>('reel');
  const [uploadedMedia, setUploadedMedia] = useState<File[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState<any[]>([]);

  async function handleGenerate() {
    if (!uploadedMedia.length && !textInput) {
      alert('Bitte Video/Bild hochladen oder Text eingeben!');
      return;
    }

    setIsGenerating(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of uploadedMedia) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData: UploadResponse = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.success) {
          throw new Error(uploadData.error || `Upload fehlgeschlagen: ${file.name}`);
        }

        if (uploadData.previewUrl) {
          uploadedUrls.push(uploadData.previewUrl);
        }
      }

      if (uploadedMedia.length > 0) {
        window.dispatchEvent(new Event('uploads:refresh'));
      }

      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: selectedPlatforms,
          format: selectedFormat,
          text_input: textInput,
          media_urls: uploadedUrls,
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setGeneratedPosts(Array.isArray(data.posts) ? data.posts : []);
        alert(`${Array.isArray(data.posts) ? data.posts.length : 0} Posts generiert! ${uploadedUrls.length} Dateien hochgeladen!`);
      } else {
        alert('Fehler: ' + (data.error || 'Unbekannter Fehler'));
      }
    } catch (err) {
      console.error('Generate failed:', err);
      alert(err instanceof Error ? err.message : 'Generierung fehlgeschlagen!');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '20px' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>🎨 Content Studio</h1>
            <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '14px' }}>Multi-Platform Content Creation Engine</p>
          </div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            style={{ background: '#1a1a1a', color: '#fff', border: '1px solid #333', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
          >
            Dashboard →
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: '16px', padding: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>🎯 Platform & Format</h2>
          <PlatformSelector selected={selectedPlatforms} onChange={setSelectedPlatforms} multiSelect={true} />
          <div style={{ marginTop: '16px' }}>
            <FormatSelector platform={selectedPlatforms[0]} selected={selectedFormat} onChange={setSelectedFormat} />
          </div>
        </div>

        <MediaUploader files={uploadedMedia} onChange={setUploadedMedia} />
        <TextInput value={textInput} onChange={setTextInput} />
        <AIGenerator textInput={textInput} onGenerate={(generated) => setTextInput(generated)} />
        <GenerateButton
          onClick={handleGenerate}
          isGenerating={isGenerating}
          disabled={!uploadedMedia.length && !textInput}
        />

        {generatedPosts.length > 0 && (
          <PreviewPanel
            posts={generatedPosts}
            onDownload={() => alert('Download coming soon!')}
            onPublish={() => alert('Publish coming soon!')}
          />
        )}
      </div>
    </div>
  );
}
