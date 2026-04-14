import { NextRequest, NextResponse } from 'next/server'

export type PackageType = 'go' | 'pro' | 'ultra'

export function hasValidSession(req: NextRequest): boolean {
  const token = req.headers.get('authorization')
  return !!token
}

// TEMP: später durch echte DB ersetzen
export async function getUserPackage(req: NextRequest): Promise<PackageType> {
  const header = req.headers.get('x-aiyu-package')

  if (header === 'ultra') return 'ultra'
  if (header === 'pro') return 'pro'
  return 'go'
}

export async function requirePackage(
  req: NextRequest,
  required: PackageType
) {
  const pkg = await getUserPackage(req)

  const order: Record<PackageType, number> = {
    go: 0,
    pro: 1,
    ultra: 2,
  }

  if (order[pkg] < order[required]) {
    return NextResponse.json(
      {
        ok: false,
        error: `Paket "${required.toUpperCase()}" erforderlich.`,
        required_package: required,
        current_package: pkg,
      },
      { status: 403 }
    )
  }

  return null
}
