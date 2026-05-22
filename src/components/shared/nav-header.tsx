import { Link } from '@tanstack/react-router'
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { PROJECT_NAME } from '#/lib/constants'

export function NavHeader({
  ...props
}: React.ComponentProps<typeof SidebarHeader>) {
  return (
    <SidebarHeader {...props}>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link to="/" className="flex items-center gap-2 text-primary">
              <img
                src="/logo192.png"
                alt="EtalaseKu"
                className="h-7 w-7 rounded"
              />
              <span className="text-xl font-medium">{PROJECT_NAME}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}
