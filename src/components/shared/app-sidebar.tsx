import { Sidebar } from '@/components/ui/sidebar'
import { NavHeader } from './nav-header'
import { NavMain } from './nav-main'
import { NavFooter } from './nav-footer'

export function AppSidebar({ ...props }) {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <NavHeader />
      <NavMain />
      <NavFooter />
    </Sidebar>
  )
}
