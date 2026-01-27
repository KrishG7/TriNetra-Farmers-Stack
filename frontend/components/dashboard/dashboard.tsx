"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "./sidebar"
import { DashboardTab } from "./tabs/dashboard-tab"
import { MarketTab } from "./tabs/market-tab"
import { SoilTab } from "./tabs/soil-vision"
import { CreditTab } from "./tabs/credit-tab"
import { useLanguage } from "@/lib/language-context"
import { ProfileDropdown } from "./profile-dropdown"

type TabType = "dashboard" | "market" | "soil" | "credit"

// --- TRANSLATIONS ---
const translations: Record<string, any> = {
  en: { live: "Live Data", updated: "Last updated", connected: "Connected" },
  hi: { live: "लाइव डेटा", updated: "अंतिम अपडेट", connected: "कनेक्टेड" },
  pb: { live: "ਲਾਈਵ ਡਾਟਾ", updated: "ਆਖਰੀ ਵਾਰ ਅੱਪਡੇਟ ਕੀਤਾ", connected: "ਜੁੜਿਆ ਹੋਇਆ" }
}

export function Dashboard() {
  const { language } = useLanguage()
  const t = translations[language] || translations["en"]

  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // --- FIX: HYDRATION ERROR STATE ---
  const [timeStr, setTimeStr] = useState<string>("")

  useEffect(() => {
    // Only set time on the client side after mounting
    setTimeStr(new Date().toLocaleTimeString())
    
    // Optional: Update time every second to make it a real live clock
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString())
    }, 1000)

    return () => clearInterval(timer)
  }, [])
  // ----------------------------------

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab />
      case "market":
        return <MarketTab />
      case "soil":
        return <SoilTab />
      case "credit":
        return <CreditTab />
      default:
        return <DashboardTab />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 p-6",
          sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        {/* Top Bar */}
        <header className="nature-card-elevated rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm text-muted-foreground">{t.live}</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">
              {/* USE THE STATE VARIABLE HERE INSTEAD OF new Date() */}
              {t.updated}: {timeStr || "--:--:--"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg status-success text-sm font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              {t.connected}
            </div>
            <ProfileDropdown />
          </div>
        </header>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-300">{renderTab()}</div>
      </main>
    </div>
  )
}