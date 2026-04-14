export const POSTMEISTER_PACKAGE_COOKIE = 'postmeister_package'

export type PackageType = 'go' | 'pro' | 'ultra'

export function normalizePackage(value: string | null | undefined): PackageType {
  const raw = String(value || '').toLowerCase()

  if (raw === 'go' || raw === 'pro' || raw === 'ultra') {
    return raw
  }

  return 'pro'
}
