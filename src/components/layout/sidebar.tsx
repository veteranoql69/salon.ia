'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Users, Wallet, Scissors, LogOut, Menu, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SidebarProps {
  userName: string
  role: string
  slug: string
}

export function Sidebar({ userName, role, slug }: SidebarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const links = [
    { name: "Inicio", href: `/${slug}/dashboard`, icon: LayoutDashboard },
    { name: "Agenda", href: `/${slug}/agenda`, icon: Calendar },
    ...(role === 'OWNER' ? [{ name: "CRM", href: `/${slug}/crm`, icon: Users }] : []),
    { name: "Finanzas", href: `/${slug}/finanzas`, icon: Wallet },
    { name: "Sillones", href: `/${slug}/sillones`, icon: Scissors },
  ]

  const NavLinks = () => (
    <div className="flex flex-col gap-2 flex-1 w-full mt-8">
      {links.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link key={link.name} href={link.href} onClick={() => setIsOpen(false)}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-primary/20 text-primary border border-primary/30' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent'}`}>
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.name}</span>
            </div>
          </Link>
        )
      })}
    </div>
  )

  const UserFooter = () => (
    <div className="mt-auto border-t border-white/10 pt-6 flex flex-col gap-4">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-medium truncate text-foreground">{userName}</p>
          <p className="text-xs text-muted-foreground truncate uppercase tracking-widest font-bold opacity-70">
            {role === 'OWNER' ? 'Gerente' : 'Especialista'}
          </p>
        </div>
      </div>
      <form action="/auth/signout" method="post">
        <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl">
          <LogOut className="w-5 h-5 mr-3" />
          Cerrar Sesión
        </Button>
      </form>
    </div>
  )

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-foreground">Salon<span className="text-primary">.IA</span></span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" />}>
            <Menu className="w-6 h-6" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-zinc-950 border-white/10 p-6 flex flex-col">
          <span className="text-2xl font-bold text-foreground mb-4">Salon<span className="text-primary">.IA</span></span>
            <NavLinks />
            <UserFooter />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 flex-col bg-background/40 backdrop-blur-xl border-r border-white/5 h-full p-6 relative z-10 shadow-2xl">
        <div className="flex items-center gap-2 px-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tighter uppercase italic">Salon<span className="text-primary">.IA</span></span>
        </div>
        <NavLinks />
        <UserFooter />
      </aside>
    </>
  )
}
