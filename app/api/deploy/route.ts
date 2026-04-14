import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'

export async function POST(req: NextRequest): Promise<Response> {
  const secret = req.headers.get('x-deploy-secret')

  if (secret !== process.env.DEPLOY_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const output = await new Promise<string>((resolve, reject) => {
      exec('cd /var/www/aiyu && ./deploy.sh', (error, stdout, stderr) => {
        if (error) {
          reject(stderr)
        } else {
          resolve(stdout)
        }
      })
    })

    console.log(output)

    return NextResponse.json({ ok: true, output })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
