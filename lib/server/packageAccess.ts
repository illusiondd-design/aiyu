import { NextRequest, NextResponse } from 'next/server'
import { POSTMEISTER_PACKAGE_COOKIE, PackageType, normalizePackage } from '@/lib/auth/package'

export function getPackageType(req: NextRequest): PackageType {
  const cookieValue = req.cookies.get(POSTMEISTER_PACKAGE_COOKIE)?.value
  if (cookieValue) {
    return normalizePackage(cookieValue)
  }

  const headerValue = req.headers.get('x-aiyu-package')
  if (headerValue) {
    return normalizePackage(headerValue)
  }

  return 'pro'
}

export function hasAtLeastPackage(current: PackageType, required: PackageType): boolean {
  const rank: Record<PackageType, number> = {
    go: 1,
    pro: 2,
    ultra: 3,
  }

  return rank[current] >= rank[required]
}

export function requirePackage(req: NextRequest, required: PackageType): NextResponse | null {
  const current = getPackageType(req)

  if (!hasAtLeastPackage(current, required)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Paket "${required.toUpperCase()}" erforderlich.`,
        required_package: required,
        current_package: current,
      },
      { status: 403 }
    )
  }

  return null
}
