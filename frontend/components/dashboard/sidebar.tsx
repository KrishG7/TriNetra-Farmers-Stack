"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  Leaf,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Home,
  Languages 
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLanguage } from "@/lib/language-context"

type TabType = "dashboard" | "market" | "soil" | "credit"

interface SidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  collapsed: boolean
  onToggle: () => void
}

// --- TRANSLATIONS FOR SIDEBAR ---
const sidebarTranslations: Record<string, any> = {
  en: { dashboard: "Dashboard", market: "Market Vision", soil: "Soil Vision", credit: "Credit Vision", home: "Back to Home", system: "System Online" },
  hi: { dashboard: "डैशबोर्ड", market: "बाजार दृष्टि", soil: "मृदा दृष्टि", credit: "क्रेडिट दृष्टि", home: "मुख्य पृष्ठ", system: "सिस्टम सक्रिय" },
  pb: { dashboard: "ਡੈਸ਼ਬੋਰਡ", market: "ਮਾਰਕੀਟ ਵਿਜ਼ਨ", soil: "ਮਿੱਟੀ ਵਿਜ਼ਨ", credit: "ਕ੍ਰੈਡਿਟ ਵਿਜ਼ਨ", home: "ਘਰ ਵਾਪਸ", system: "ਸਿਸਟਮ ਚਾਲੂ" },
  gj: { dashboard: "ડેશબોર્ડ", market: "બજાર દ્રષ્ટિ", soil: "જમીન દ્રષ્ટિ", credit: "ક્રેડિટ દ્રષ્ટિ", home: "હોમ પેજ", system: "સિસ્ટમ ચાલુ" },
  ta: { dashboard: "டாஷ்போர்டு", market: "சந்தை பார்வை", soil: "மண் பார்வை", credit: "கடன் பார்வை", home: "முகப்பு", system: "சிஸ்டம் ஆன்லைன்" },
  te: { dashboard: "డాష్‌బోర్డ్", market: "మార్కెట్ విజన్", soil: "సాయిల్ విజన్", credit: "క్రెడిట్ విజన్", home: "హోమ్ పేజీ", system: "సిస్టమ్ ఆన్‌లైన్" },
  bn: { dashboard: "ড্যাশবোর্ড", market: "বাজার দৃষ্টি", soil: "মাটি দৃষ্টি", credit: "ক্রেডিট দৃষ্টি", home: "হোম পেজ", system: "সিস্টেম অনলাইন" }
}

export function Sidebar({ activeTab, onTabChange, collapsed, onToggle }: SidebarProps) {
  const { language, setLanguage } = useLanguage()
  const t = sidebarTranslations[language] || sidebarTranslations["en"]

  const navItems = [
    { id: "dashboard" as TabType, label: t.dashboard, icon: LayoutDashboard },
    { id: "market" as TabType, label: t.market, icon: TrendingUp },
    { id: "soil" as TabType, label: t.soil, icon: Leaf },
    { id: "credit" as TabType, label: t.credit, icon: CreditCard },
  ]

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-between border-b border-sidebar-border px-4 shrink-0">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
            <Leaf className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-wider text-sidebar-foreground">
                TriNetra
              </span>
              <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
                Agri Intelligence
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors shadow-md",
            collapsed && "right-[-12px]"
          )}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                    collapsed && "justify-center px-0",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70"
                    )}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer Area */}
      <div className="px-3 pb-6 space-y-4">
        
        {/* --- LANGUAGE SWITCHER --- */}
        {!collapsed && (
          <div className="px-1">
            <div className="flex items-center gap-2 mb-2 text-xs text-sidebar-foreground/60">
                <Languages className="h-3 w-3" />
                <span>Language</span>
            </div>
            <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-8 bg-sidebar-accent/50 border-sidebar-border text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                    <SelectItem value="pb">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                    <SelectItem value="gj">ગુજરાતી (Gujarati)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                </SelectContent>
            </Select>
          </div>
        )}

        {/* Back to Home Link */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200",
            collapsed && "justify-center px-0"
          )}
        >
          <Home size={20} className="shrink-0" />
          {!collapsed && <span>{t.home}</span>}
        </Link>

        {/* System Status */}
        <div
          className={cn(
            "rounded-xl p-3 bg-sidebar-accent/30",
            collapsed ? "flex items-center justify-center" : ""
          )}
        >
          {collapsed ? (
            <div className="h-2 w-2 rounded-full bg-sidebar-primary animate-pulse" />
          ) : (
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-sidebar-primary animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-sidebar-foreground">{t.system}</span>
                <span className="text-[10px] text-sidebar-foreground/60">All services active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}