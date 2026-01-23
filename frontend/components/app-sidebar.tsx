"use client"

import * as React from "react"
import { Frame, Map, PieChart } from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user?: { id: string; name: string; email: string } }) {
  const displayUser = user

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {displayUser && (
          <NavUser user={{ 
            name: displayUser.name, 
            email: displayUser.email, 
            avatar: "/avatars/default.jpg" 
          }} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
