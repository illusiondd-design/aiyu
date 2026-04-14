'use client';

import { ReactNode } from 'react';
import { PackageFeature } from '@/lib/packages';
import { hasFeature } from '@/lib/permissions';

interface FeatureGateProps {
  feature: PackageFeature;
  currentPackage: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({
  feature,
  currentPackage,
  children,
  fallback,
}: FeatureGateProps) {
  const hasAccess = hasFeature(currentPackage as any, feature);

  if (!hasAccess) {
    return fallback || (
      <div style={{
        padding: '20px',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔒</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Feature nicht verfügbar
        </div>
        <div style={{ fontSize: '14px', color: '#999', marginBottom: '16px' }}>
          Upgrade für erweiterte Funktionen
        </div>
        <button style={{
          background: '#0070f3',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
        }}>
          Jetzt upgraden
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
