"use client"

import { useState, useRef, useCallback } from "react"
import {
  CreditCard,
  Loader2,
  AlertCircle,
  Crosshair,
  Wheat,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import dynamic from "next/dynamic"
import { useLanguage } from "@/lib/language-context"
import type { CreditTranslations } from "@/lib/types"

// --- TRANSLATIONS ---
const translations: Record<string, CreditTranslations> = {
  en: {
    title: "Credit Vision",
    subtitle: "Satellite-Based Credit Scoring System",
    loc_details: "Location Details",
    btn_detect: "Auto-Detect",
    lbl_lat: "Latitude",
    lbl_lng: "Longitude",
    lbl_yield: "Claimed Yield (Quintals/Acre)",
    btn_calc: "Calculate Credit Score",
    res_title: "Credit Score Result",
    res_score: "Health Score",
    res_analysis: "Analysis",
    drag_hint: "📍 Drag marker or enter coordinates",
    status_elig: "ELIGIBLE",
    status_review: "UNDER REVIEW",
    status_risk: "HIGH RISK"
  },
  hi: {
    title: "क्रेडिट दृष्टि",
    subtitle: "उपग्रह-आधारित क्रेडिट स्कोरिंग",
    loc_details: "स्थान विवरण",
    btn_detect: "स्वतः पता लगाएं",
    lbl_lat: "अक्षांश",
    lbl_lng: "देशांतर",
    lbl_yield: "दावा की गई उपज (क्विंटल/एकड़)",
    btn_calc: "क्रेडिट स्कोर की गणना करें",
    res_title: "क्रेडिट स्कोर परिणाम",
    res_score: "स्वास्थ्य स्कोर",
    res_analysis: "विश्लेषण",
    drag_hint: "📍 मार्कर खींचें या निर्देशांक दर्ज करें",
    status_elig: "पात्र",
    status_review: "समीक्षाधीन",
    status_risk: "उच्च जोखिम"
  },
  pb: {
    title: "ਕ੍ਰੈਡਿਟ ਵਿਜ਼ਨ",
    subtitle: "ਸੈਟੇਲਾਈਟ-ਅਧਾਰਤ ਕਰਜ਼ਾ ਪ੍ਰਣਾਲੀ",
    loc_details: "ਸਥਾਨ ਵੇਰਵੇ",
    btn_detect: "ਆਟੋ-ਖੋਜ",
    lbl_lat: "ਵਿਥਕਾਰ",
    lbl_lng: "ਲੰਬਕਾਰ",
    lbl_yield: "ਦਾਅਵਾ ਕੀਤਾ ਝਾੜ (ਕੁਇੰਟਲ/ਏਕੜ)",
    btn_calc: "ਕ੍ਰੈਡਿਟ ਸਕੋਰ ਦੀ ਗਣਨਾ ਕਰੋ",
    res_title: "ਕ੍ਰੈਡਿਟ ਸਕੋਰ ਨਤੀਜਾ",
    res_score: "ਸਿਹਤ ਸਕੋਰ",
    res_analysis: "ਵਿਸ਼ਲੇਸ਼ਣ",
    drag_hint: "📍 ਮਾਰਕਰ ਖਿੱਚੋ ਜਾਂ ਕੋਆਰਡੀਨੇਟਸ ਭਰੋ",
    status_elig: "ਯੋਗ",
    status_review: "ਸਮੀਖਿਆ ਅਧੀਨ",
    status_risk: "ਉੱਚ ਜੋਖਮ"
  }
}

// Dynamically import the map component to avoid SSR issues
const CreditMap = dynamic(() => import("./credit-map").then(mod => mod.CreditMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-muted/20 rounded-2xl">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

interface CreditResult {
  status: "APPROVED" | "REVIEW" | "REJECTED"
  health_score: number
  land_type: string
  message: string
}

export function CreditTab() {
  const { language } = useLanguage()
  const t = translations[language] || translations["en"]

  const [lat, setLat] = useState("28.7041")
  const [lng, setLng] = useState("77.1025")
  const [yieldClaim, setYieldClaim] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<CreditResult | null>(null)

  const [markerPosition, setMarkerPosition] = useState<[number, number]>([28.7041, 77.1025])
  const mapRef = useRef<{ flyTo: (lat: number, lng: number) => void } | null>(null)

  // 1. Handle Dragging Marker on Map
  const handleMarkerDrag = useCallback((newLat: number, newLng: number) => {
    setLat(newLat.toFixed(6))
    setLng(newLng.toFixed(6))
    setMarkerPosition([newLat, newLng])
  }, [])

  // 2. Handle Manual Typing (Updates Map)
  const handleManualCoordChange = (type: 'lat' | 'lng', value: string) => {
    if (type === 'lat') setLat(value)
    else setLng(value)

    const numLat = type === 'lat' ? parseFloat(value) : parseFloat(lat)
    const numLng = type === 'lng' ? parseFloat(value) : parseFloat(lng)

    // Only update map if coordinates are valid numbers
    if (!isNaN(numLat) && !isNaN(numLng)) {
      setMarkerPosition([numLat, numLng])
      mapRef.current?.flyTo(numLat, numLng)
    }
  }

  // 3. Auto-Detect Location
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser")
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newLat = latitude.toFixed(6)
        const newLng = longitude.toFixed(6)

        setLat(newLat)
        setLng(newLng)

        // Update Map
        setMarkerPosition([latitude, longitude])
        mapRef.current?.flyTo(latitude, longitude)

        setLoading(false)
        setError("")
      },
      (err) => {
        console.error(err)
        setError("Unable to retrieve location. Please allow permissions.")
        setLoading(false)
      }
    )
  }

  const calculateScore = async () => {
    if (!yieldClaim) {
      setError("Please enter your claimed yield")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/analyze/credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ SEND LANGUAGE TO BACKEND
        body: JSON.stringify({
          lat: Number(lat),
          lng: Number(lng),
          claimed_yield: Number(yieldClaim),
          lang: language
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to calculate score")
      }

      const data = await response.json()
      setResult(data)
    } catch {
      // Demo fallback in case API fails
      setResult({
        status: "REVIEW",
        health_score: 55,
        land_type: "Agricultural",
        message: "Moderate vegetation detected. Manual verification recommended.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent/10 p-2">
            <CreditCard className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Map Panel - Takes up 3 columns */}
        <div className="lg:col-span-3 nature-card-elevated rounded-2xl p-0 h-[600px] relative overflow-hidden">
          {/* Map */}
          <div className="h-full w-full">
            <CreditMap
              ref={mapRef}
              position={markerPosition}
              onMarkerDrag={handleMarkerDrag}
            />
          </div>
          {/* Map Overlay Hint */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-xs text-muted-foreground z-[400] shadow-sm">
            {t.drag_hint}
          </div>
        </div>

        {/* Control Panel - Takes up 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="nature-card-elevated rounded-2xl p-6">

            {/* Location Section */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{t.loc_details}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={detectLocation}
                  className="text-primary hover:text-primary border-primary/20 hover:bg-primary/5 h-8 text-xs"
                >
                  <Crosshair className="w-3 h-3 mr-1" />
                  {t.btn_detect}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t.lbl_lat}</Label>
                  <Input
                    value={lat}
                    onChange={(e) => handleManualCoordChange('lat', e.target.value)}
                    className="bg-background font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">{t.lbl_lng}</Label>
                  <Input
                    value={lng}
                    onChange={(e) => handleManualCoordChange('lng', e.target.value)}
                    className="bg-background font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Yield Input */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yield" className="text-sm text-foreground flex items-center gap-2">
                  <Wheat size={14} />
                  {t.lbl_yield}
                </Label>
                <Input
                  type="number"
                  id="yield"
                  placeholder="e.g. 25"
                  value={yieldClaim}
                  onChange={(e) => setYieldClaim(e.target.value)}
                  className="bg-background border-border text-foreground"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              <Button
                onClick={calculateScore}
                disabled={loading}
                className="w-full bg-foreground hover:bg-foreground/90 text-background font-semibold h-11"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  t.btn_calc
                )}
              </Button>
            </div>
          </div>

          {/* Results Panel */}
          {result && (
            <div className="nature-card-elevated rounded-2xl p-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <h2 className="text-lg font-semibold text-foreground mb-4">{t.res_title}</h2>

              <div className="space-y-4">
                {/* Status Badge */}
                <div
                  className={`p-4 rounded-xl text-center border ${result.health_score > 60
                      ? "bg-success/10 text-success border-success/20"
                      : result.health_score > 0
                        ? "bg-warning/10 text-warning border-warning/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    }`}
                >
                  <div className="text-xl font-bold">
                    {result.health_score > 60
                      ? t.status_elig
                      : result.health_score > 0
                        ? t.status_review
                        : t.status_risk}
                  </div>
                </div>

                {/* Score Details */}
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t.res_score}</span>
                      <span
                        className={`text-2xl font-bold ${result.health_score > 60
                            ? "text-success"
                            : result.health_score > 0
                              ? "text-warning"
                              : "text-destructive"
                          }`}
                      >
                        {result.health_score}/100
                      </span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4">
                    <span className="text-sm text-muted-foreground">{t.res_analysis}</span>
                    <p className="text-foreground text-sm mt-1">{result.message}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}