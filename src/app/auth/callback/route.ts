import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && session) {
      // Determine role from DB to route correctly immediately after login
      const { data: profile } = await supabase
        .from('brb_profiles')
        .select('role, onboarding_completed')
        .eq('id', session.user.id)
        .maybeSingle()

      let targetUrl = '/onboarding' // Default: new users go to onboarding

      if (profile?.onboarding_completed) {
        // Existing users with completed onboarding go to dashboard
        const role = profile.role || 'CLIENT'
        targetUrl = (role === 'OWNER' || role === 'BARBER') ? '/dashboard' : '/'
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

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with provider`)
}