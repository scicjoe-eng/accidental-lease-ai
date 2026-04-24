import {
  FileSearch,
  FileText,
  LayoutDashboard,
  Sparkles,
} from "lucide-react"

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Contract Generator", icon: FileText },
  { href: "/audit", label: "Audit Existing Contract", icon: FileSearch },
  { href: "/upgrade", label: "Upgrade", icon: Sparkles },
] as const
