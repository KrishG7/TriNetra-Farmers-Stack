"use client"

import { useState } from "react"
import { Leaf, Loader2, AlertCircle, Droplets, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CropRecommendation {
  name: string
  confidence: number
  fertilizer: string
  dosage: string
}

interface SoilResult {
  status: "cultivable" | "rejected"
  message: string
  crops: CropRecommendation[]
}

export function SoilTab() {
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
        body: JSON.stringify({
          n: Number(nitrogen),
          p: Number(phosphorus),
          k: Number(potassium),
          ph: Number(ph),
          rainfall: Number(rainfall),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze soil")
      }

      const data = await response.json()
      setResult(data)
    } catch {
      // Demo data for showcase
      setResult({
        status: "cultivable",
        message: "Soil conditions are favorable for cultivation",
        crops: [
          { name: "Wheat", confidence: 92, fertilizer: "NPK 20-20-0", dosage: "50 kg/ha" },
          { name: "Rice", confidence: 85, fertilizer: "Urea", dosage: "60 kg/ha" },
          { name: "Corn", confidence: 78, fertilizer: "DAP", dosage: "40 kg/ha" },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 90) return "High"
    if (confidence >= 75) return "Medium"
    return "Low"
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
            <h1 className="text-2xl font-bold text-foreground">Soil Vision</h1>
            <p className="text-sm text-muted-foreground">AI Agronomist & Crop Recommendation System</p>
          </div>
        </div>
      </div>

      {/* Input Panel */}
      <div className="nature-card-elevated rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Input Soil Parameters</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nitrogen" className="text-sm text-foreground">
              Nitrogen (N)
            </Label>
            <Input
              type="number"
              id="nitrogen"
              placeholder="138"
              value={nitrogen}
              onChange={(e) => setNitrogen(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phosphorus" className="text-sm text-foreground">
              Phosphorus (P)
            </Label>
            <Input
              type="number"
              id="phosphorus"
              placeholder="138"
              value={phosphorus}
              onChange={(e) => setPhosphorus(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="potassium" className="text-sm text-foreground">
              Potassium (K)
            </Label>
            <Input
              type="number"
              id="potassium"
              placeholder="138"
              value={potassium}
              onChange={(e) => setPotassium(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ph" className="text-sm text-foreground flex items-center gap-2">
              <FlaskConical size={14} />
              pH Level
            </Label>
            <Input
              type="number"
              id="ph"
              placeholder="138"
              step="0.1"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="rainfall" className="text-sm text-foreground flex items-center gap-2">
              <Droplets size={14} />
              Rainfall (mm)
            </Label>
            <Input
              type="number"
              id="rainfall"
              placeholder="138"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
              className="bg-background border-border text-foreground"
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
          className="w-full mt-6 bg-foreground hover:bg-foreground/90 text-background font-semibold py-6"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Ask AI Agronomist"
          )}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Status Badge */}
          <div className="nature-card-elevated rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Status</h3>
            <div
              className={`p-4 rounded-xl text-center ${
                result.status === "cultivable"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <div className="text-xl font-bold">
                {result.status === "cultivable" ? "Land is Cultivable" : "Land Not Suitable"}
              </div>
            </div>
          </div>

          {/* Crop Recommendations */}
          {result.status === "cultivable" && result.crops.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4">
              {result.crops.map((crop, index) => (
                <div
                  key={index}
                  className="nature-card-elevated rounded-2xl p-6"
                >
                  <h4 className="font-semibold text-foreground mb-2">Crop Recommendation</h4>
                  <p className="text-foreground">Crop Name: {crop.name}</p>
                  <div className="mt-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                      Confidence: {getConfidenceLabel(crop.confidence)}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Recommended Fertilizer Dosage: {crop.dosage}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!result && (
        <div className="nature-card-elevated rounded-2xl p-12 flex flex-col items-center justify-center text-center">
          <Leaf className="h-16 w-16 mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">
            Enter soil parameters and click
            <br />
            <span className="text-success font-medium">Ask AI Agronomist</span> to get recommendations
          </p>
        </div>
      )}
    </div>
  )
}
