import { Link } from '@tanstack/react-router'
import { Store } from 'lucide-react'
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
              <Store />
              <span className="text-lg font-bold">Etalaseku</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
