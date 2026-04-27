import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { AIPanel } from '@/components/layout/ai-panel'

export default async function SlugDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('brb_profiles')
    .select('role, full_name, org_id')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !profile || profile.role === 'CLIENT') {
    redirect('/')
  }

  // Validate the slug in the URL matches the user's organization
  const { data: org } = await supabase
    .from('brb_organizations')
    .select('slug')
    .eq('id', profile.org_id)
    .maybeSingle()

  if (!org || org.slug !== slug) {
    redirect('/')
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar userName={profile.full_name || 'Usuario'} role={profile.role} slug={slug} />
      <main className="flex-1 h-full overflow-y-auto bg-background/50 relative pt-16 md:pt-0 pr-16">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 w-full h-full p-4 md:p-8">
          {children}
        </div>
      </main>
      <AIPanel />
    </div>
  )
}
