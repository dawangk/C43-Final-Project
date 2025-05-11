import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import Logo from "./logo"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Stock Trader",
      logo: GalleryVerticalEnd,
      plan: "CSCC43",
    },
  ],
  navMain: [
    {
      title: "My Holdings",
      url: "",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Stock Lists",
          url: "/dashboard/stock-lists",
        },
        {
          title: "Portfolios",
          url: "/dashboard/portfolios",
        },
      ],
    },
    {
      title: "Social",
      url: "",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Friends",
          url: "/dashboard/friends",
        },
        {
          title: "Shared with me",
          url: "/dashboard/shared",
        },
        {
          title: "Browse Stock Lists",
          url: "/dashboard/public-lists",
        },
      ],
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
        {/* <Logo /> */}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {/* <NavUser user={data.user} /> */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
