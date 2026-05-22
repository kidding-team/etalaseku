import { Link } from '@tanstack/react-router'
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

export function NavHeader({
  ...props
}: React.ComponentProps<typeof SidebarHeader>) {
  return (
    <SidebarHeader {...props}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/" className="text-primary">
              <span className="text-2xl font-medium font-serif italic">EtalaseKu</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
