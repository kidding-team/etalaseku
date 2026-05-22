import { Link } from '@tanstack/react-router'
import { LayoutDashboard, Package, FileText, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Produk', to: '/products', icon: Package },
  { label: 'Konten', to: '/dashboard', icon: FileText },
  { label: 'Landing Page', to: '/dashboard', icon: Globe },
]

export function NavMain({ ...props }: React.ComponentProps<typeof SidebarContent>) {
  return (
    <SidebarContent {...props}>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {NAV_ITEMS.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link to={item.to}>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      tooltip={item.label}
                      isActive={isActive}
                      className={cn(isActive && 'bg-primary! text-white!')}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  )
}
