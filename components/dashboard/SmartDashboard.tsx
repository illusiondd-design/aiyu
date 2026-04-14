'use client';

import { useEffect, useState } from 'react';
import { PACKAGES, PackageKey } from '@/lib/packages';
import { hasFeature, getLimitStatus, formatPrice } from '@/lib/permissions';
import { FeatureGate } from '@/components/FeatureGate';
import { LimitGate } from '@/components/LimitGate';

type Post = {
  id: number;
  platform: string | null;
  video_status?: string | null;
  music_status?: string | null;
  final_status?: string | null;
  publish_status?: string | null;
  final_reel_path?: string | null;
};

export default function SmartDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPackage] = useState<PackageKey>('starter'); // TODO: Aus DB/Context holen
  const [usage] = useState({ videos: 7, posts: 106, storage: 2 }); // TODO: Aus API holen

  const pkg = PACKAGES[currentPackage];
  const videoLimit = getLimitStatus(currentPackage, 'videos_per_month', usage.videos);
  const postLimit = getLimitStatus(currentPackage, 'posts_total', usage.posts);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await fetch('/api/posts?limit=100');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Load posts failed:', err);
    } finally {
      setLoading(false);
    }
  }

  const needsVideo = posts.filter(p => !p.video_status || p.video_status === 'none').length;
  const needsMusic = posts.filter(p => p.video_status === 'completed' && !p.music_status).length;
  const ready = posts.filter(p => p.final_reel_path && !p.publish_status).length;
  const published = posts.filter(p => p.publish_status === 'published').length;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '20px' }}>
      
      {/* HEADER */}
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px' }}>PostMeister</h1>
          <p style={{ margin: '5px 0 0 0', color: '#888', fontSize: '14px' }}>
            Content Pipeline & Publishing
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{
              background: showAdvanced ? '#0070f3' : '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            {showAdvanced ? '⚙️ Advanced aktiv' : '⚙️ Advanced'}
          </button>
          
          <button
            onClick={() => window.location.href = '/api/auth/logout'}
            style={{
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* PACKAGE INFO */}
        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid #2a2a4a',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#888', marginBottom: '4px' }}>
                Aktuelles Paket
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                {pkg.label}
              </div>
              <div style={{ fontSize: '16px', color: '#0070f3' }}>
                {formatPrice(pkg.priceMonthly)}/Monat
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#888' }}>Videos</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {videoLimit.used}/{videoLimit.isUnlimited ? '∞' : videoLimit.limit}
                </div>
                {!videoLimit.isUnlimited && (
                  <div style={{ 
                    width: '80px', 
                    height: '4px', 
                    background: '#333', 
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}>
                    <div style={{
                      width: `${videoLimit.percentage}%`,
                      height: '100%',
                      background: videoLimit.isReached ? '#ff6b6b' : '#0070f3',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                )}
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#888' }}>Posts</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {postLimit.used}/{postLimit.isUnlimited ? '∞' : postLimit.limit}
                </div>
                {!postLimit.isUnlimited && (
                  <div style={{ 
                    width: '80px', 
                    height: '4px', 
                    background: '#333', 
                    borderRadius: '2px',
                    overflow: 'hidden',
                    marginTop: '4px'
                  }}>
                    <div style={{
                      width: `${postLimit.percentage}%`,
                      height: '100%',
                      background: postLimit.isReached ? '#ff6b6b' : '#0070f3',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                )}
              </div>
            </div>
            
            {pkg.upgradeTo.length > 0 && (
              <button style={{
                background: '#0070f3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                Upgrade ↗
              </button>
            )}
          </div>
        </div>

        {/* VIDEO UPLOAD */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px',
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>📹 Video hochladen</h2>
          
          <LimitGate
            limitKey="videos_per_month"
            currentPackage={currentPackage}
            used={usage.videos}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input 
                type="file" 
                accept="video/*"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <button style={{
                background: '#0070f3',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
              }}>
                Upload starten
              </button>
            </div>
          </LimitGate>
        </div>

        {/* POSTS OVERVIEW */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>📊 Posts ({posts.length})</h2>
            <button
              onClick={loadPosts}
              style={{
                background: '#2a2a2a',
                color: '#fff',
                border: '1px solid #333',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Neu laden
            </button>
          </div>

          {/* STATUS PILLS */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <StatusPill label="Braucht Video" count={needsVideo} color="#ff6b6b" />
            <StatusPill label="Braucht Musik" count={needsMusic} color="#ffa500" />
            <StatusPill label="Fertig" count={ready} color="#51cf66" />
            <StatusPill label="Published" count={published} color="#0070f3" />
          </div>

          {/* POST GRID */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              Lädt Posts...
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              Keine Posts vorhanden. Lade dein erstes Video hoch!
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '16px',
            }}>
              {posts.slice(0, 20).map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* ADVANCED SECTION */}
        {showAdvanced && (
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '16px',
            padding: '24px',
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>⚙️ Advanced Tools</h2>
            
            <FeatureGate feature="bulk_actions" currentPackage={currentPackage}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
                  Bulk Actions
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button style={advancedButtonStyle}>Bulk Video</button>
                  <button style={advancedButtonStyle}>Bulk Music</button>
                  <button style={advancedButtonStyle}>Bulk Final</button>
                  <button style={advancedButtonStyle}>Bulk Publish</button>
                </div>
              </div>
            </FeatureGate>

            <div>
              <h3 style={{ fontSize: '14px', color: '#888', marginBottom: '8px' }}>
                Activity Log
              </h3>
              <div style={{
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px',
                maxHeight: '200px',
                overflowY: 'auto',
                fontSize: '12px',
                color: '#888',
              }}>
                Activity Log wird geladen...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: `${color}22`,
      border: `1px solid ${color}44`,
      borderRadius: '20px',
      fontSize: '14px',
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        background: color,
      }} />
      <span>{label}</span>
      <span style={{ fontWeight: 'bold', color }}>{count}</span>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const getStatus = () => {
    if (post.publish_status === 'published') return { label: '✅ Published', color: '#0070f3' };
    if (post.final_reel_path) return { label: '✅ Fertig', color: '#51cf66' };
    if (post.music_status === 'completed') return { label: '⏳ Musik fertig', color: '#ffa500' };
    if (post.video_status === 'completed') return { label: '⏳ Video fertig', color: '#ffa500' };
    return { label: '⏳ Braucht Video', color: '#ff6b6b' };
  };

  const status = getStatus();

  return (
    <div style={{
      background: '#0a0a0a',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = '#555';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = '#333';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
        Post #{post.id}
      </div>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
        {post.platform || 'Instagram'}
      </div>
      <div style={{
        display: 'inline-block',
        padding: '4px 12px',
        background: `${status.color}22`,
        border: `1px solid ${status.color}44`,
        borderRadius: '12px',
        fontSize: '12px',
        color: status.color,
      }}>
        {status.label}
      </div>
    </div>
  );
}

const advancedButtonStyle = {
  background: '#2a2a2a',
  color: '#fff',
  border: '1px solid #444',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
};
