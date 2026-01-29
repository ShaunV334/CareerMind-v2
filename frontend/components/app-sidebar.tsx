"use client"

import * as React from "react"
import { FileText, Briefcase, Users, BookOpen, HelpCircle, ListTodo, BarChart3, Zap, Lightbulb, Brain } from "lucide-react"

import { NavProjects } from "@/components/nav-projects"
import { NavMain } from "@/components/nav-main"
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
      name: "Weekly Tasks",
      url: "/dashboard/weekly-tasks",
      icon: ListTodo,
    },
  ],
  nav: [
    {
      title: "Aptitude",
      url: "/dashboard/aptitude",
      icon: Brain,
      items: [
        {
          title: "Quantitative",
          url: "/dashboard/aptitude/quantitative",
        },
        {
          title: "Logical",
          url: "/dashboard/aptitude/logical",
        },
        {
          title: "Verbal",
          url: "/dashboard/aptitude/verbal",
        },
        {
          title: "Data Interpretation",
          url: "/dashboard/aptitude/data-interpretation",
        },
        {
          title: "Psychometric Test",
          url: "/dashboard/aptitude/psychometric",
        },
      ],
    },
    {
      title: "Syllabus",
      url: "/dashboard/syllabus",
      icon: BookOpen,
      items: [
        {
          title: "All Syllabuses",
          url: "/dashboard/syllabus",
        },
        {
          title: "Google",
          url: "/dashboard/syllabus/google",
        },
        {
          title: "Amazon",
          url: "/dashboard/syllabus/amazon",
        },
        {
          title: "Microsoft",
          url: "/dashboard/syllabus/microsoft",
        },
        {
          title: "Accenture",
          url: "/dashboard/syllabus/accenture",
        },
        {
          title: "TCS",
          url: "/dashboard/syllabus/tcs",
        },
        {
          title: "Infosys",
          url: "/dashboard/syllabus/infosys",
        },
      ],
    },
    {
      title: "Interview Prep",
      url: "/dashboard/interview-prep",
      icon: Briefcase,
      items: [
        {
          title: "All Companies",
          url: "/dashboard/interview-prep",
        },
        {
          title: "Google",
          url: "/dashboard/interview-prep/google",
        },
        {
          title: "Amazon",
          url: "/dashboard/interview-prep/amazon",
        },
        {
          title: "Microsoft",
          url: "/dashboard/interview-prep/microsoft",
        },
        {
          title: "Accenture",
          url: "/dashboard/interview-prep/accenture",
        },
      ],
    },
    {
      title: "Interview Exp.",
      url: "/dashboard/interviews",
      icon: Lightbulb,
      items: [
        {
          title: "All Experiences",
          url: "/dashboard/interviews",
        },
        {
          title: "Google",
          url: "/dashboard/interviews/google",
        },
        {
          title: "Amazon",
          url: "/dashboard/interviews/amazon",
        },
        {
          title: "Microsoft",
          url: "/dashboard/interviews/microsoft",
        },
        {
          title: "Success Stories",
          url: "/dashboard/interviews/success-stories",
        },
      ],
    },
    {
      title: "Group Discussions",
      url: "/dashboard/group-discussions",
      icon: Users,
    },
    {
      title: "Study Materials",
      url: "/dashboard/study-materials",
      icon: BookOpen,
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
        <NavMain items={data.nav} />
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
