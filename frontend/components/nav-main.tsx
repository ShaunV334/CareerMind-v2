"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <div className="flex items-center">
                {/* Main link - navigates to the module page */}
                <Link href={item.url} className="flex-1">
                  <SidebarMenuButton tooltip={item.title} asChild>
                    <div className="cursor-pointer">
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </Link>
                
                {/* Chevron - only triggers expand/collapse */}
                {item.items && item.items.length > 0 && (
                  <CollapsibleTrigger asChild>
                    <button
                      className="p-2 hover:bg-sidebar-accent rounded-md transition-colors"
                      aria-label="Toggle menu"
                    >
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 w-4 h-4" />
                    </button>
                  </CollapsibleTrigger>
                )}
              </div>
              
              {/* Submenu */}
              {item.items && item.items.length > 0 && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
