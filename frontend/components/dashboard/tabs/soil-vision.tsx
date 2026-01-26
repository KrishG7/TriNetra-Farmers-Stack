"use client"

import { useState } from "react"
import { Leaf, Loader2, AlertCircle, Droplets, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/lib/language-context"

// --- TRANSLATIONS ---
const translations: Record<string, any> = {
  en: {
    title: "Soil Vision",
    subtitle: "AI Agronomist & Crop Recommendation System",
    input_title: "Input Soil Parameters",
    lbl_n: "Nitrogen (N) (kg/ha)",
    lbl_p: "Phosphorus (P) (kg/ha)",
    lbl_k: "Potassium (K) (kg/ha)",
    lbl_ph: "pH Level",
    lbl_rain: "Rainfall (mm)",
    btn_ask: "Ask AI Agronomist",
    btn_analyzing: "Analyzing...",
    res_cultivable: "Land is Cultivable",
    res_not_cultivable: "Land Not Cultivable",
    res_status: "Status",
    empty_msg: "Enter soil parameters and click",
    crops: { wheat: "Wheat", rice: "Rice", maize: "Maize" }
  },
  hi: {
    title: "मृदा दृष्टि",
    subtitle: "एआई कृषिविज्ञानी और फसल सिफारिश प्रणाली",
    input_title: "मिट्टी के पैरामीटर दर्ज करें",
    lbl_n: "नाइट्रोजन (N) (kg/ha)",
    lbl_p: "फॉस्फोरस (P) (kg/ha)",
    lbl_k: "पोटेशियम (K) (kg/ha)",
    lbl_ph: "pH स्तर",
    lbl_rain: "वर्षा (mm)",
    btn_ask: "एआई एग्रोनोमिस्ट से पूछें",
    btn_analyzing: "विश्लेषण हो रहा है...",
    res_cultivable: "भूमि खेती योग्य है",
    res_not_cultivable: "भूमि खेती योग्य नहीं है",
    res_status: "स्थिति",
    empty_msg: "मिट्टी के पैरामीटर दर्ज करें और क्लिक करें",
    crops: { wheat: "गेहूँ", rice: "चावल", maize: "मक्का" }
  },
  pb: {
    title: "ਮਿੱਟੀ ਵਿਜ਼ਨ",
    subtitle: "AI ਖੇਤੀਬਾੜੀ ਮਾਹਰ ਅਤੇ ਫਸਲ ਦੀ ਸਿਫਾਰਸ਼",
    input_title: "ਮਿੱਟੀ ਦੇ ਮਾਪਦੰਡ ਦਰਜ ਕਰੋ",
    lbl_n: "ਨਾਈਟ੍ਰੋਜਨ (N) (kg/ha)",
    lbl_p: "ਫਾਸਫੋਰਸ (P) (kg/ha)",
    lbl_k: "ਪੋਟਾਸ਼ੀਅਮ (K) (kg/ha)",
    lbl_ph: "pH ਪੱਧਰ",
    lbl_rain: "ਮੀਂਹ (mm)",
    btn_ask: "AI ਐਗਰੋਨੋਮਿਸਟ ਨੂੰ ਪੁੱਛੋ",
    btn_analyzing: "ਵਿਸ਼ਲੇਸ਼ਣ ਕਰ ਰਿਹਾ ਹੈ...",
    res_cultivable: "ਜ਼ਮੀਨ ਖੇਤੀ ਯੋਗ ਹੈ",
    res_not_cultivable: "ਜ਼ਮੀਨ ਖੇਤੀ ਯੋਗ ਨਹੀਂ ਹੈ",
    res_status: "ਸਥਿਤੀ",
    empty_msg: "ਮਿੱਟੀ ਦੇ ਮਾਪਦੰਡ ਭਰੋ ਅਤੇ ਕਲਿੱਕ ਕਰੋ",
    crops: { wheat: "ਕਣਕ", rice: "ਚੌਲ", maize: "ਮੱਕੀ" }
  }
}

interface CropRecommendation {
  crop: string
  confidence: "High" | "Medium" | "Low"
  urea_dose: string
  dap_dose: string
  mop_dose: string
  reason: string
}

interface SoilResult {
  cultivable: boolean
  message: string
  explanation?: string
  crops: CropRecommendation[]
}

export function SoilTab() {
  const { language } = useLanguage()
  const t = translations[language] || translations["en"]

  const [nitrogen, setNitrogen] = useState("")
  const [phosphorus, setPhosphorus] = useState("")
  const [potassium, setPotassium] = useState("")
  const [ph, setPh] = useState("")
  const [rainfall, setRainfall] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<SoilResult | null>(null)

  const analyzeSoil = async () => {
    if (!nitrogen || !phosphorus || !potassium || !ph || !rainfall) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/analyze/soil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ SEND LANGUAGE TO BACKEND
        body: JSON.stringify({
          nitrogen: Number(nitrogen),
          phosphorus: Number(phosphorus),
          potassium: Number(potassium),
          ph: Number(ph),
          rainfall: Number(rainfall),
          lang: language
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze soil")
      }

      const data = await response.json()
      setResult(data)
    } catch {
      // Demo fallback
      setResult({
        cultivable: true,
        message: "Demo Mode (AI Failed)",
        explanation: "This is sample data because the connection failed.",
        crops: [
          {
            crop: t.crops.wheat,
            confidence: "High",
            urea_dose: "45",
            dap_dose: "25",
            mop_dose: "10",
            reason: "Balanced nutrients favor wheat growth",
          },
          {
            crop: t.crops.rice,
            confidence: "Medium",
            urea_dose: "60",
            dap_dose: "30",
            mop_dose: "20",
            reason: "Requires high rainfall and nitrogen",
          },
          {
            crop: t.crops.maize,
            confidence: "Medium",
            urea_dose: "40",
            dap_dose: "20",
            mop_dose: "15",
            reason: "Performs well in moderate soil conditions",
          },
        ],
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
          <div className="rounded-xl bg-success/10 p-2">
            <Leaf className="h-6 w-6 text-success" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Input Panel */}
      <div className="nature-card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">
          {t.input_title}
        </h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>{t.lbl_n}</Label>
            <Input
              type="number"
              placeholder="0-140"
              value={nitrogen}
              onChange={(e) => setNitrogen(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.lbl_p}</Label>
            <Input
              type="number"
              placeholder="0-145"
              value={phosphorus}
              onChange={(e) => setPhosphorus(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t.lbl_k}</Label>
            <Input
              type="number"
              placeholder="0-205"
              value={potassium}
              onChange={(e) => setPotassium(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FlaskConical size={14} /> {t.lbl_ph}
            </Label>
            <Input
              type="number"
              step="0.1"
              placeholder="0-14"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Droplets size={14} /> {t.lbl_rain}
            </Label>
            <Input
              type="number"
              placeholder="0-5000"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm mt-4">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <Button
          onClick={analyzeSoil}
          disabled={loading}
          className="w-full mt-6 bg-foreground text-background py-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.btn_analyzing}
            </>
          ) : (
            t.btn_ask
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="nature-card-elevated rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">{t.res_status}</h3>
            <div
              className={`p-4 rounded-xl text-center ${
                result.cultivable
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <div className="text-xl font-bold">
                {result.cultivable ? t.res_cultivable : t.res_not_cultivable}
              </div>
            </div>

            {result.explanation && (
              <p className="mt-3 text-sm text-muted-foreground">
                {result.explanation}
              </p>
            )}
          </div>

          {result.cultivable && result.crops.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4">
              {result.crops.map((crop, index) => (
                <div key={index} className="nature-card-elevated rounded-2xl p-6">
                  <h4 className="font-semibold mb-2">{crop.crop}</h4>

                  <span className="inline-block px-3 py-1 rounded-full bg-muted text-sm">
                    Confidence: {crop.confidence}
                  </span>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Urea: {crop.urea_dose} kg/acre <br />
                    DAP: {crop.dap_dose} kg/acre <br />
                    MOP: {crop.mop_dose} kg/acre
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">{crop.reason}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!result && (
        <div className="nature-card-elevated rounded-2xl p-12 text-center">
          <Leaf className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            {t.empty_msg} <br />
            <span className="font-medium text-success">
              {t.btn_ask}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}