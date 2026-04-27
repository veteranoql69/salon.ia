// Route group layout — passthrough only.
// Auth and slug validation are handled by (dashboard)/[slug]/layout.tsx.
export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
