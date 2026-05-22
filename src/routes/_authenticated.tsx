import * as React from 'react'
import {
  createFileRoute,
  Outlet,
  useLocation,
  useRouter,
  Link,
} from '@tanstack/react-router'
import { AppSidebar } from '@/components/shared/app-sidebar'
import ThemeToggle from '@/components/ThemeToggle'
import {
  SidebarInset,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { supabase } from '@/lib/supabase'
import { LayoutDashboard, Package, FileText, Globe } from 'lucide-react'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

const navItems = [
  { title: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' as const },
  { title: 'Produk', icon: Package, to: '/dashboard' as const },
  { title: 'Konten', icon: FileText, to: '/konten' as const },
  { title: 'Landing Page', icon: Globe, to: '/dashboard' as const },
]

function AuthenticatedLayout() {
  const router = useRouter()

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.navigate({ to: '/login' })
    })
  }, [router])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <section className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/75 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <DynamicBreadcrumb />
          </div>
          <ThemeToggle />
        </section>
        <main className="h-full p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DynamicBreadcrumb() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const path = '/' + segments.slice(0, index + 1).join('/')
          const label = segment.charAt(0).toUpperCase() + segment.slice(1)
          const isLast = index === segments.length - 1

          return (
            <React.Fragment key={path}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={path}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

type NavItem = (typeof navItems)[number]

function NavLinkItem({ item }: { item: NavItem }) {
  const location = useLocation()
  const isActive =
    location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={item.to}>
          <item.icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
