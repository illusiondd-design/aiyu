'use client';

import { useState } from 'react';

interface Post {
  id: number;
  platform: string;
  format: string;
  caption: string;
  hashtags: string[];
  media_url?: string;
  preview_url?: string;
}

interface Props {
  posts: Post[];
  onDownload: () => void;
  onPublish: () => void;
}

export default function PreviewPanel({ posts, onDownload, onPublish }: Props) {
  const [selectedPost, setSelectedPost] = useState(0);

  const post = posts[selectedPost];

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '16px',
      padding: '24px',
      position: 'sticky',
      top: '20px',
      maxHeight: 'calc(100vh - 40px)',
      overflowY: 'auto',
    }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
        👀 Preview ({posts.length} Posts)
      </h2>

      {/* POST SELECTOR */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        {posts.map((p, i) => (
          <button
            key={i}
            onClick={() => setSelectedPost(i)}
            style={{
              background: selectedPost === i ? '#0070f3' : '#0a0a0a',
              border: `1px solid ${selectedPost === i ? '#0070f3' : '#333'}`,
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '12px',
              color: selectedPost === i ? 'white' : '#888',
              whiteSpace: 'nowrap',
            }}
          >
            {p.platform} {p.format}
          </button>
        ))}
      </div>

      {/* PREVIEW */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #333',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}>
        {/* PLATFORM/FORMAT */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
        }}>
          <span style={{
            background: '#0070f322',
            border: '1px solid #0070f3',
            color: '#0070f3',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
          }}>
            {post.platform}
          </span>
          <span style={{
            background: '#51cf6622',
            border: '1px solid #51cf66',
            color: '#51cf66',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
          }}>
            {post.format}
          </span>
        </div>

        {/* MEDIA PREVIEW */}
        {post.preview_url && (
          <div style={{
            background: '#000',
            borderRadius: '8px',
            marginBottom: '12px',
            overflow: 'hidden',
          }}>
            {post.format.includes('video') || post.format.includes('reel') ? (
              <video
                src={post.preview_url}
                controls
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <img
                src={post.preview_url}
                alt="Preview"
                style={{
                  width: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                }}
              />
            )}
          </div>
        )}

        {/* CAPTION */}
        <div style={{
          fontSize: '14px',
          lineHeight: '1.6',
          marginBottom: '12px',
          whiteSpace: 'pre-wrap',
        }}>
          {post.caption}
        </div>

        {/* HASHTAGS */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div style={{
            fontSize: '13px',
            color: '#0070f3',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
          }}>
            {post.hashtags.map((tag, i) => (
              <span key={i}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* ACTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onDownload}
          style={{
            background: '#0a0a0a',
            border: '1px solid #0070f3',
            color: '#0070f3',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          📥 Download ({posts.length} Posts)
        </button>

        <button
          onClick={onPublish}
          style={{
            background: '#51cf66',
            border: 'none',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          🚀 Publishen
        </button>
      </div>

      {/* INFO */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: '#0a0a0a',
        border: '1px solid #333',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#888',
      }}>
        💡 Downloads als ZIP mit allen Formaten + Captions
      </div>
    </div>
  );
}
