import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platforms, format, text_input, media_urls } = body;

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Mindestens eine Platform erforderlich' },
        { status: 400 }
      );
    }

    const posts = [];
    const batch_id = `content-studio-${Date.now()}`;

    for (const platform of platforms) {
      const caption = `${text_input}\n\nFolge uns für mehr ${platform} Content!`;
      const hashtags = ['demo', 'test', platform];

      const { data, error } = await supabaseAdmin
        .from('generated_social_posts')
        .insert({
          platform,
          format_type: format,
          content: caption,
          caption,
          hashtags,
          status: 'generated',
          review_status: 'pending',
          video_prompt: text_input,
          batch_id,
          video_local_path: media_urls && media_urls.length > 0 ? media_urls[0] : null,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ SUPABASE INSERT ERROR:', JSON.stringify(error, null, 2));
      } else if (data) {
        console.log('✅ POST CREATED:', data.id);
        posts.push(data);

        // PixVerse Auto-Trigger deaktiviert (nur in Production)
        if (!media_urls || media_urls.length === 0) {
          console.log(`⏭️ Post ${data.id} needs video - trigger manually via Dashboard`);
        }
      }
    }

    return NextResponse.json({
      ok: true,
      posts,
      message: `${posts.length} Posts erfolgreich generiert und gespeichert!`,
    });
  } catch (error) {
    console.error('Content generate error:', error);
    return NextResponse.json(
      { ok: false, error: 'Server Error', details: String(error) },
      { status: 500 }
    );
  }
}
