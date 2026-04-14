'use client';

import { ReactNode } from 'react';
import { PackageLimit } from '@/lib/packages';
import { getLimitStatus } from '@/lib/permissions';

interface LimitGateProps {
  limitKey: PackageLimit;
  currentPackage: string;
  used: number;
  children: ReactNode;
  fallback?: ReactNode;
}

export function LimitGate({
  limitKey,
  currentPackage,
  used,
  children,
  fallback,
}: LimitGateProps) {
  const status = getLimitStatus(currentPackage as any, limitKey, used);

  if (status.isReached) {
    return fallback || (
      <div style={{
        padding: '20px',
        background: '#2a1a1a',
        border: '1px solid #663333',
        borderRadius: '12px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚠️</div>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          Limit erreicht
        </div>
        <div style={{ fontSize: '14px', color: '#ff6b6b', marginBottom: '16px' }}>
          {status.used} von {status.limit} genutzt
        </div>
        <button style={{
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
        }}>
          Upgrade für mehr
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
