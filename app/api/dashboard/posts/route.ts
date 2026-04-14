import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('generated_social_posts')
      .select(`
        id,
        platform,
        review_status,
        video_status,
        video_local_path,
        music_status,
        music_local_path,
        final_status,
        final_reel_path,
        publish_status,
        publish_target,
        published_url,
        created_at
      `)
      .order('id', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      posts: data ?? [],
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unbekannter Fehler'

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
