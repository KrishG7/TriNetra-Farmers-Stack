"use client"

import { API_BASE_URL } from "@/lib/config";
import { useState, useEffect } from "react"
import { TrendingUp, Loader2, AlertCircle, Calendar, Package, MapPin, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts"
import { useLanguage } from "@/lib/language-context"

const translations: Record<string, any> = {
    en: {
        title: "Market Vision",
        subtitle: "AI-Powered Price Prediction Engine",
        lbl_crop: "Select Crop",
        lbl_state: "Select State",
        lbl_market: "Select Market (Mandi)",
        lbl_date: "Forecast Date",
        lbl_qty: "Quantity",
        btn_run: "Run Prediction",
        btn_processing: "Processing...",
        res_forecast: "Forecast Price",
        res_unit: "per Quintal",
        res_rec: "Recommendation",
        empty_title: "Enter prediction parameters and click",
        empty_subtitle: "to see results",
        crops: { wheat: "Wheat", rice: "Rice", cotton: "Cotton", corn: "Corn", maize: "Maize", onion: "Onion", potato: "Potato", mustard: "Mustard", soybean: "Soybean", gram: "Gram", tur: "Tur" }
    },
    hi: {
        title: "बाजार दृष्टि",
        subtitle: "एआई-संचालित मूल्य भविष्यवाणी इंजन",
        lbl_crop: "फसल चुनें",
        lbl_state: "राज्य चुनें",
        lbl_market: "मंडी चुनें",
        lbl_date: "पूर्वानुमान तिथि",
        lbl_qty: "मात्रा",
        btn_run: "भविष्यवाणी करें",
        btn_processing: "प्रक्रिया जारी है...",
        res_forecast: "पूर्वानुमानित मूल्य",
        res_unit: "प्रति क्विंटल",
        res_rec: "सिफारिश",
        empty_title: "पैरामीटर दर्ज करें और क्लिक करें",
        empty_subtitle: "परिणाम देखने के लिए",
        crops: { wheat: "गेहूँ", rice: "चावल", cotton: "कपास", corn: "मक्का", maize: "मक्का", onion: "प्याज", potato: "आलू", mustard: "सरसों", soybean: "सोयाबीन", gram: "चना", tur: "अरहर" }
    },
    pb: {
        title: "ਮਾਰਕੀਟ ਵਿਜ਼ਨ",
        subtitle: "AI-ਦੁਆਰਾ ਕੀਮਤ ਦੀ ਭਵਿੱਖਬਾਣੀ",
        lbl_crop: "ਫਸਲ ਚੁਣੋ",
        lbl_state: "ਰਾਜ ਚੁਣੋ",
        lbl_market: "ਮੰਡੀ ਚੁਣੋ",
        lbl_date: "ਭਵਿੱਖਬਾਣੀ ਮਿਤੀ",
        lbl_qty: "ਮਾਤਰਾ",
        btn_run: "ਭਵਿੱਖਬਾਣੀ ਚਲਾਓ",
        btn_processing: "ਕਾਰਵਾਈ ਜਾਰੀ ਹੈ...",
        res_forecast: "ਅਨੁਮਾਨਤ ਕੀਮਤ",
        res_unit: "ਪ੍ਰਤੀ ਕੁਇੰਟਲ",
        res_rec: "ਸਿਫਾਰਸ਼",
        empty_title: "ਵੇਰਵੇ ਭਰੋ ਅਤੇ ਕਲਿੱਕ ਕਰੋ",
        empty_subtitle: "ਨਤੀਜੇ ਵੇਖਣ ਲਈ",
        crops: { wheat: "ਕਣਕ", rice: "ਚੌਲ", cotton: "ਕਪਾਹ", corn: "ਮੱਕੀ", maize: "ਮੱਕੀ", onion: "ਪਿਆਜ਼", potato: "ਆਲੂ", mustard: "ਸਰ੍ਹੋਂ", soybean: "ਸੋਇਆਬੀਨ", gram: "ਛੋਲੇ", tur: "ਅਰਹਰ" }
    }
}

interface PredictionResult {
    forecast_price: number
    trend: { date: string; price: number }[]
    recommendation: string
    confidence: number
}

type LocationMap = Record<string, string[]>

export function MarketTab() {
    const { language } = useLanguage()
    const t = translations[language] || translations["en"]

    const [crop, setCrop] = useState("")
    const [state, setState] = useState("")
    const [market, setMarket] = useState("")
    const [date, setDate] = useState("")
    const [quantity, setQuantity] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [result, setResult] = useState<PredictionResult | null>(null)

    const [locations, setLocations] = useState<LocationMap>({})
    const [loadingLocations, setLoadingLocations] = useState(true)

    useEffect(() => {
        async function fetchLocations() {
            try {
                const res = await fetch(`${API_BASE_URL}/api/market/locations`)
                if (res.ok) {
                    const data = await res.json()
                    setLocations(data)
                }
            } catch (err) {
                console.error("Failed to load locations", err)
            } finally {
                setLoadingLocations(false)
            }
        }
        fetchLocations()
    }, [])

    const runPrediction = async () => {
        if (!crop || !state || !date || !quantity) {
            setError("Please fill in all fields")
            return
        }

        setLoading(true)
        setError("")

        try {
            const response = await fetch("/api/analyze/market", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    crop,
                    state,
                    market,
                    date,
                    quantity: Number(quantity),
                    lang: language
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to fetch prediction")
            }

            const data = await response.json()
            setResult(data)
        } catch {
            const demoTrend = Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                }),
                price: 2200 + Math.random() * 300 - 150 + i * 20,
            }))

            setResult({
                forecast_price: 2450,
                trend: demoTrend,
                recommendation: "Simulation Mode: Market is stable.",
                confidence: 87.5,
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2">
                        <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
                        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
                    </div>
                </div>
            </div>

            <div className="nature-card-elevated rounded-2xl p-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-2 min-w-[160px]">
                        <Label className="text-sm text-muted-foreground flex gap-2 items-center">
                            <Package size={14} /> {t.lbl_crop}
                        </Label>
                        <Select value={crop} onValueChange={setCrop}>
                            <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder={t.lbl_crop} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {Object.entries(t.crops).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>{label as string}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 min-w-[160px]">
                        <Label className="text-sm text-muted-foreground flex gap-2 items-center">
                            <MapPin size={14} /> {t.lbl_state}
                        </Label>
                        <Select value={state} onValueChange={(val) => { setState(val); setMarket("") }}>
                            <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder={loadingLocations ? "Loading..." : t.lbl_state} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {Object.keys(locations).map((locState) => (
                                    <SelectItem key={locState} value={locState}>{locState}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 min-w-[160px]">
                        <Label className="text-sm text-muted-foreground flex gap-2 items-center">
                            <Store size={14} /> {t.lbl_market}
                        </Label>
                        <Select value={market} onValueChange={setMarket} disabled={!state}>
                            <SelectTrigger className="bg-background border-border text-foreground">
                                <SelectValue placeholder={t.lbl_market} />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                {state && locations[state]?.map((mkt) => (
                                    <SelectItem key={mkt} value={mkt}>{mkt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 min-w-[160px]">
                        <Label className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar size={14} /> {t.lbl_date}
                        </Label>
                        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-background border-border text-foreground" />
                    </div>

                    <div className="space-y-2 min-w-[120px]">
                        <Label className="text-sm text-muted-foreground flex items-center gap-2">
                            <Package size={14} /> {t.lbl_qty}
                        </Label>
                        <Input type="number" placeholder="100" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="bg-background border-border text-foreground" />
                    </div>

                    <Button onClick={runPrediction} disabled={loading} className="bg-foreground hover:bg-foreground/90 text-background font-semibold px-6">
                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.btn_processing}</> : t.btn_run}
                    </Button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm mt-4">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}
            </div>

            {result ? (
                <div className="nature-card-elevated rounded-2xl p-8">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">{t.res_forecast}</p>
                            <p className="text-6xl font-bold text-foreground">₹{result.forecast_price.toLocaleString()}</p>
                            <p className="text-muted-foreground mt-2">{t.res_unit}</p>
                            <div className="mt-8 p-4 rounded-xl bg-muted/50 border border-border">
                                <p className="text-foreground font-medium">{t.res_rec}: <span className="text-primary">{result.recommendation}</span></p>
                            </div>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={result.trend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                    <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                                    <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} formatter={(value: number | undefined) => [
                                        `₹${value?.toFixed(0) ?? '0'}`,
                                        "Price"
                                    ]} />
                                    <Line type="monotone" dataKey="price" stroke="var(--foreground)" strokeWidth={2} dot={{ fill: "var(--foreground)", strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: "var(--foreground)" }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="nature-card-elevated rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                    <TrendingUp className="h-16 w-16 mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">{t.empty_title}<br /><span className="text-primary font-medium">{t.btn_run}</span> {t.empty_subtitle}</p>
                </div>
            )}
        </div>
    )
}