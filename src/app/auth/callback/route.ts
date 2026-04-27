import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session) {
      // Save Google tokens if present (Calendar integration)
      if (session.provider_token) {
        const admin = createAdminClient();
        const expiresAt = session.expires_at
          ? new Date(session.expires_at * 1000).toISOString()
          : null;
        await admin.from("brb_profiles").upsert(
          {
            id: session.user.id,
            email: session.user.email,
            google_access_token: session.provider_token,
            google_refresh_token: session.provider_refresh_token ?? null,
            google_token_expires_at: expiresAt,
          },
          { onConflict: "id" }
        );
      }

      const userEmail = session.user.email

      const { data: profile } = await supabase
        .from('brb_profiles')
        .select('role, onboarding_completed, org_id')
        .eq('id', session.user.id)
        .maybeSingle()

      let targetUrl = '/onboarding/owner'

      if (profile?.onboarding_completed) {
        // Existing user with completed onboarding → go to their dashboard
        const role = profile.role || 'CLIENT'
        if (role === 'OWNER' || role === 'BARBER') {
          if (profile.org_id) {
            const { data: org } = await supabase
              .from('brb_organizations')
              .select('slug')
              .eq('id', profile.org_id)
              .maybeSingle()
            targetUrl = org?.slug ? `/${org.slug}/dashboard` : '/dashboard'
          }
        }
      } else {
        // New user — check if they were invited by email
        if (userEmail) {
          const { data: invite } = await supabase
            .from('brb_invite_codes')
            .select('code')
            .eq('invited_email', userEmail)
            .is('used_by', null)
            .maybeSingle()

          if (invite?.code) {
            targetUrl = `/onboarding/invited?code=${invite.code}`
          }
          // else: stays /onboarding/owner (new owner flow)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${targetUrl}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${targetUrl}`)
      } else {
        return NextResponse.redirect(`${origin}${targetUrl}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with provider`)
}
