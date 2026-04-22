import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { AIPanel } from '@/components/layout/ai-panel'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error } = await supabase
    .from('brb_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  console.log(`[Dashboard Layout] Access attempt by ${user.email}. Role: ${profile?.role}`);

  if (error || !profile || profile.role === 'CLIENT') {
    console.log(`[Dashboard Layout] Access denied. Redirecting to /`);
    redirect('/')
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar userName={profile.full_name || 'Usuario'} role={profile.role} />
      <main className="flex-1 h-full overflow-y-auto bg-background/50 relative pt-16 md:pt-0 pr-16">
        {/* Decorative background lights */}
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
