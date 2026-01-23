"use client"

import * as React from "react"
import { FileText, Briefcase, Users, BookOpen, HelpCircle, ListTodo, BarChart3 } from "lucide-react"

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
      name: "Home",
      url: "/dashboard",
      icon: BarChart3,
    },
    {
      name: "Resume Builder",
      url: "/dashboard/resume",
      icon: FileText,
    },
    {
      name: "Interview Prep",
      url: "/dashboard/interview",
      icon: Briefcase,
    },
    {
      name: "Group Discussions",
      url: "/dashboard/group-discussions",
      icon: Users,
    },
    {
      name: "Study Materials",
      url: "/dashboard/study-materials",
      icon: BookOpen,
    },
    {
      name: "Question Bank",
      url: "/dashboard/question-bank",
      icon: HelpCircle,
    },
    {
      name: "Weekly Tasks",
      url: "/dashboard/weekly-tasks",
      icon: ListTodo,
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
