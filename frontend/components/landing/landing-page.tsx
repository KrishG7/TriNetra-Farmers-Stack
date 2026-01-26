"use client"

import { useState } from "react"
import {
    Leaf,
    TrendingUp,
    CreditCard,
    ArrowRight,
    ChevronRight,
    BarChart3,
    Shield,
    Zap,
    Users,
    Menu,
    X,
    Phone,
    User,
    MapPin,
    Languages
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// 1. IMPORT THE GLOBAL HOOK
import { useLanguage } from "@/lib/language-context"

// --- TRANSLATION DICTIONARY ---
const translations: Record<string, any> = {
  en: {
    features: "Features",
    howItWorks: "How It Works",
    login: "Login",
    register: "Register",
    heroTitle: "Empowering Farmers with",
    heroHighlight: "Smart Insights",
    heroDesc: "TriNetra combines satellite imagery, AI predictions, and soil analysis to help Indian farmers make better decisions about crops, markets, and credit.",
    getStarted: "Get Started Free",
    learnMore: "Learn More",
    stats_ai: "AI Models Integrated",
    stats_states: "States Supported",
    stats_realtime: "Satellite Analysis",
    stats_free: "Free for Farmers",
    featuresTitle: "Three Pillars of Agricultural Intelligence",
    howWorksTitle: "How TriNetra Works",
    ctaTitle: "Ready to Transform Your Farm?"
  },
  hi: {
    features: "सुविधाएँ",
    howItWorks: "यह कैसे काम करता है",
    login: "लॉग इन करें",
    register: "पंजीकरण करें",
    heroTitle: "किसानों को सशक्त बनाना",
    heroHighlight: "स्मार्ट इनसाइट्स के साथ",
    heroDesc: "त्रिनेत्र फसल, बाजार और ऋण के बारे में बेहतर निर्णय लेने में भारतीय किसानों की मदद करने के लिए उपग्रह इमेजरी, एआई भविष्यवाणियों और मिट्टी के विश्लेषण को जोड़ता है।",
    getStarted: "मुफ्त में शुरू करें",
    learnMore: "और अधिक जानें",
    stats_ai: "एआई मॉडल एकीकृत",
    stats_states: "राज्य समर्थित",
    stats_realtime: "उपग्रह विश्लेषण",
    stats_free: "किसानों के लिए मुफ्त",
    featuresTitle: "कृषि बुद्धिमत्ता के तीन स्तंभ",
    howWorksTitle: "त्रिनेत्र कैसे काम करता है",
    ctaTitle: "क्या आप अपने खेत को बदलने के लिए तैयार हैं?"
  },
  pb: {
    features: "ਵਿਸ਼ੇਸ਼ਤਾਵਾਂ",
    howItWorks: "ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    login: "ਲੌਗ ਇਨ",
    register: "ਰਜਿਸਟਰ ਕਰੋ",
    heroTitle: "ਕਿਸਾਨਾਂ ਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣਾ",
    heroHighlight: "ਸਮਾਰਟ ਜਾਣਕਾਰੀ ਨਾਲ",
    heroDesc: "ਟ੍ਰਾਈਨੇਤਰਾ ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਨੂੰ ਫਸਲਾਂ, ਮੰਡੀਆਂ ਅਤੇ ਕਰਜ਼ੇ ਬਾਰੇ ਬਿਹਤਰ ਫੈਸਲੇ ਲੈਣ ਵਿੱਚ ਮਦਦ ਕਰਨ ਲਈ ਸੈਟੇਲਾਈਟ ਚਿੱਤਰਾਂ ਅਤੇ AI ਦੀ ਵਰਤੋਂ ਕਰਦਾ ਹੈ।",
    getStarted: "ਮੁਫਤ ਸ਼ੁਰੂ ਕਰੋ",
    learnMore: "ਹੋਰ ਜਾਣੋ",
    stats_ai: "AI ਮਾਡਲ ਏਕੀਕ੍ਰਿਤ",
    stats_states: "ਰਾਜ ਸਮਰਥਿਤ",
    stats_realtime: "ਸੈਟੇਲਾਈਟ ਵਿਸ਼ਲੇਸ਼ਣ",
    stats_free: "ਕਿਸਾਨਾਂ ਲਈ ਮੁਫਤ",
    featuresTitle: "ਖੇਤੀਬਾੜੀ ਖੁਫੀਆ ਜਾਣਕਾਰੀ ਦੇ ਤਿੰਨ ਥੰਮ੍ਹ",
    howWorksTitle: "ਟ੍ਰਾਈਨੇਤਰਾ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ",
    ctaTitle: "ਕੀ ਤੁਸੀਂ ਆਪਣੇ ਖੇਤ ਨੂੰ ਬਦਲਣ ਲਈ ਤਿਆਰ ਹੋ?"
  },
  gj: { features: "વૈશિષ્ટ્યો", howItWorks: "કામગીરી", login: "લૉગ ઇન", register: "રજીસ્ટર", heroTitle: "ખેડૂતોને સશક્તિકરણ", heroHighlight: "સ્માર્ટ માહિતી", heroDesc: "ત્રિનેત્ર ખેડૂતોને મદદ કરે છે...", getStarted: "શરૂ કરો", learnMore: "વધુ જાણો", stats_ai: "AI મોડલ્સ", stats_states: "રાજ્યો", stats_realtime: "સેટેલાઇટ વિશ્લેષણ", stats_free: "મફત સેવા", featuresTitle: "ત્રણ આધારસ્તંભો", howWorksTitle: "કેવી રીતે કામ કરે છે", ctaTitle: "તૈયાર છો?" },
  mr: { features: "वैशिष्ट्ये", howItWorks: "कार्यपद्धती", login: "लॉगिन", register: "नोंदणी", heroTitle: "शेतकऱ्यांना सक्षम करणे", heroHighlight: "स्मार्ट माहितीद्वारे", heroDesc: "त्रिनेत्र शेतकऱ्यांना मदत करते...", getStarted: "सुरू करा", learnMore: "अधिक जाणून घ्या", stats_ai: "AI मॉडेल्स", stats_states: "राज्ये", stats_realtime: "उपग्रह विश्लेषण", stats_free: "मोफत सेवा", featuresTitle: "तीन आधारस्तंभ", howWorksTitle: "कसे कार्य करते", ctaTitle: "तयार आहात?" },
  ta: { features: "அம்சங்கள்", howItWorks: "எப்படி வேலை செய்கிறது", login: "உள்நுழைய", register: "பதிவு", heroTitle: "விவசாயிகளுக்கு அதிகாரம்", heroHighlight: "ஸ்மார்ட் நுண்ணறிவு", heroDesc: "ட்ரைநெட்ரா விவசாயிகளுக்கு உதவுகிறது...", getStarted: "தொடங்கவும்", learnMore: "மேலும் அறிய", stats_ai: "AI மாதிரிகள்", stats_states: "மாநிலங்கள்", stats_realtime: "செயற்கைக்கோள்", stats_free: "இலவசம்", featuresTitle: "மூன்று தூண்கள்", howWorksTitle: "எப்படி வேலை செய்கிறது", ctaTitle: "தயாரா?" },
  te: { features: "లక్షణాలు", howItWorks: "ఇది ఎలా పనిచేస్తుంది", login: "లాగిన్", register: "నమోదు", heroTitle: "రైతులకు సాధికారత", heroHighlight: "స్మార్ట్ ఇన్సైట్స్", heroDesc: "ట్రైనేత్రా రైతులకు సహాయపడుతుంది...", getStarted: "ప్రారంభించండి", learnMore: "మరింత తెలుసుకోండి", stats_ai: "AI నమూనాలు", stats_states: "రాష్ట్రాలు", stats_realtime: "ఉపగ్రహ విశ్లేషణ", stats_free: "ఉచితం", featuresTitle: "మూడు స్తంభాలు", howWorksTitle: "ఎలా పనిచేస్తుంది", ctaTitle: "సిద్ధంగా ఉన్నారా?" },
  bn: { features: "বৈশিষ্ট্য", howItWorks: "কিভাবে কাজ করে", login: "লগইন", register: "নিবন্ধন", heroTitle: "কৃষকদের ক্ষমতায়ন", heroHighlight: "স্মার্ট ইনসাইট", heroDesc: "ত্রিনেত্র কৃষকদের সাহায্য করে...", getStarted: "শুরু করুন", learnMore: "আরও জানুন", stats_ai: "AI মডেল", stats_states: "রাজ্য", stats_realtime: "স্যাটেলাইট বিশ্লেষণ", stats_free: "বিনামূল্যে", featuresTitle: "তিনটি স্তম্ভ", howWorksTitle: "কিভাবে কাজ করে", ctaTitle: "প্রস্তুত?" },
}

const features = [
    {
        icon: TrendingUp,
        title: "Market Vision",
        description: "AI-powered price predictions using historical data and weather patterns to optimize your selling decisions.",
        color: "text-primary",
        bg: "bg-primary/10",
    },
    {
        icon: Leaf,
        title: "Soil Vision",
        description: "Get personalized crop recommendations and fertilizer dosages based on your soil composition.",
        color: "text-success",
        bg: "bg-success/10",
    },
    {
        icon: CreditCard,
        title: "Credit Vision",
        description: "Satellite-based credit scoring system that verifies land and yields for agricultural loans.",
        color: "text-accent",
        bg: "bg-accent/10",
    },
]

const statsData = [
    { value: "3", key: "stats_ai" },
    { value: "14", key: "stats_states" },
    { value: "Real-time", key: "stats_realtime" },
    { value: "100%", key: "stats_free" },
]

const indianStates = [
    "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
    "Telangana", "Uttar Pradesh", "West Bengal",
]

export function LandingPage() {
    // 2. USE THE GLOBAL STATE instead of local useState
    const { language, setLanguage } = useLanguage()
    const t = translations[language] || translations["en"]

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [loginOpen, setLoginOpen] = useState(false)
    const [registerOpen, setRegisterOpen] = useState(false)
    const [otpSent, setOtpSent] = useState(false)
    const [loginPhone, setLoginPhone] = useState("")
    const [otp, setOtp] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Registration form state
    const [regForm, setRegForm] = useState({
        fullName: "", phone: "", state: "", district: "", village: "", landArea: "",
    })
    const [regOtpSent, setRegOtpSent] = useState(false)
    const [regOtp, setRegOtp] = useState("")

    const handleSendOtp = async () => {
        if (loginPhone.length !== 10) return
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setOtpSent(true)
        setIsLoading(false)
    }

    const handleLogin = async () => {
        if (otp.length !== 6) return
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
        setLoginOpen(false)
        window.location.href = "/dashboard"
    }

    const handleRegSendOtp = async () => {
        if (regForm.phone.length !== 10) return
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setRegOtpSent(true)
        setIsLoading(false)
    }

    const handleRegister = async () => {
        if (regOtp.length !== 6) return
        setIsLoading(true)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
        setRegisterOpen(false)
        window.location.href = "/dashboard"
    }

    const resetLoginForm = () => {
        setLoginPhone("")
        setOtp("")
        setOtpSent(false)
    }

    const resetRegForm = () => {
        setRegForm({
            fullName: "", phone: "", state: "", district: "", village: "", landArea: "",
        })
        setRegOtp("")
        setRegOtpSent(false)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                <Leaf className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">TriNetra</span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-6">

                            {/* --- GLOBAL LANGUAGE DROPDOWN --- */}
                            <div className="flex items-center gap-2">
                                <Languages className="w-4 h-4 text-primary/70" />
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="w-[120px] bg-transparent border-primary/20 text-foreground h-9 focus:ring-primary/20">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                                        <SelectItem value="pb">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                                        <SelectItem value="gj">ગુજરાતી (Gujarati)</SelectItem>
                                        <SelectItem value="mr">मराठी (Marathi)</SelectItem>
                                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                                        <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* ----------------------------- */}

                            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                {t.features}
                            </a>
                            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                {t.howItWorks}
                            </a>
                            <Button
                                variant="outline"
                                className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                                onClick={() => {
                                    resetLoginForm()
                                    setLoginOpen(true)
                                }}
                            >
                                {t.login}
                            </Button>
                            <Button
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={() => {
                                    resetRegForm()
                                    setRegisterOpen(true)
                                }}
                            >
                                {t.register}
                            </Button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-background border-b border-border">
                        <div className="px-4 py-4 space-y-4">
                            
                            {/* Mobile Language Selector */}
                            <div className="mb-4">
                                <Label>Select Language</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="hi">हिंदी</SelectItem>
                                        <SelectItem value="pb">ਪੰਜਾਬੀ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground">
                                {t.features}
                            </a>
                            <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground">
                                {t.howItWorks}
                            </a>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-primary text-primary hover:bg-primary/10 bg-transparent"
                                    onClick={() => {
                                        resetLoginForm()
                                        setLoginOpen(true)
                                        setMobileMenuOpen(false)
                                    }}
                                >
                                    {t.login}
                                </Button>
                                <Button
                                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                                    onClick={() => {
                                        resetRegForm()
                                        setRegisterOpen(true)
                                        setMobileMenuOpen(false)
                                    }}
                                >
                                    {t.register}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 gradient-nature">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                            <Zap className="h-4 w-4" />
                            AI-Powered Agricultural Intelligence
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                            {t.heroTitle}
                            <span className="text-primary"> {t.heroHighlight}</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                            {t.heroDesc}
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
                                onClick={() => {
                                    resetRegForm()
                                    setRegisterOpen(true)
                                }}
                            >
                                {t.getStarted}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <a href="#how-it-works">
                                <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-border hover:bg-muted bg-transparent">
                                    {t.learnMore}
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Stats - NOW TRANSLATED */}
                    <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {statsData.map((stat, index) => (
                            <div
                                key={index}
                                className="nature-card-elevated rounded-2xl p-6 text-center"
                            >
                                <div className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</div>
                                <div className="mt-2 text-sm text-muted-foreground">{t[stat.key]}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                            {t.featuresTitle}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Our AI-powered platform provides comprehensive tools for modern farming decisions.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon
                            return (
                                <div
                                    key={index}
                                    className="nature-card-elevated rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300"
                                >
                                    <div className={`inline-flex p-3 rounded-xl ${feature.bg}`}>
                                        <Icon className={`h-6 w-6 ${feature.color}`} />
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-foreground">{feature.title}</h3>
                                    <p className="mt-3 text-muted-foreground leading-relaxed">{feature.description}</p>
                                    <button
                                        onClick={() => {
                                            resetRegForm()
                                            setRegisterOpen(true)
                                        }}
                                        className={`inline-flex items-center mt-6 text-sm font-medium ${feature.color} hover:underline`}
                                    >
                                        Try it now
                                        <ChevronRight className="ml-1 h-4 w-4" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                            {t.howWorksTitle}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                            Simple steps to unlock agricultural intelligence for your farm.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Register Your Farm",
                                description: "Sign up with your phone number and provide basic details about your location.",
                                icon: Users,
                            },
                            {
                                step: "02",
                                title: "Enter Your Data",
                                description: "Input soil parameters, crop details, or select your location for analysis.",
                                icon: BarChart3,
                            },
                            {
                                step: "03",
                                title: "Get AI Insights",
                                description: "Our models process your data using satellite imagery and historical patterns.",
                                icon: Zap,
                            },
                            {
                                step: "04",
                                title: "Take Action",
                                description: "Make informed decisions that improve yield, profits, and sustainability.",
                                icon: Shield,
                            },
                        ].map((item, index) => {
                            const Icon = item.icon
                            return (
                                <div key={index} className="text-center">
                                    <div className="relative inline-flex items-center justify-center">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Icon className="h-7 w-7 text-primary" />
                                        </div>
                                        <span className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold text-foreground">{item.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="nature-card-elevated rounded-3xl p-12">
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                            {t.ctaTitle}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                            Join thousands of farmers using TriNetra to make smarter agricultural decisions.
                        </p>
                        <Button
                            size="lg"
                            className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-6 text-lg"
                            onClick={() => {
                                resetRegForm()
                                setRegisterOpen(true)
                            }}
                        >
                            {t.getStarted}
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                <Leaf className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-bold text-foreground">TriNetra</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            2026 TriNetra. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Login Dialog */}
            <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                <Leaf className="h-5 w-5 text-primary-foreground" />
                            </div>
                            Login to TriNetra
                        </DialogTitle>
                        <DialogDescription>
                            Enter your registered phone number to receive an OTP.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        {!otpSent ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center px-3 bg-muted rounded-md border border-border text-sm text-muted-foreground">
                                            +91
                                        </div>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Enter 10-digit number"
                                            value={loginPhone}
                                            onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90"
                                    onClick={handleSendOtp}
                                    disabled={loginPhone.length !== 10 || isLoading}
                                >
                                    {isLoading ? "Sending..." : "Send OTP"}
                                    <Phone className="ml-2 h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="text-center text-sm text-muted-foreground mb-4">
                                    OTP sent to +91 {loginPhone}
                                    <button
                                        className="text-primary hover:underline ml-2"
                                        onClick={() => setOtpSent(false)}
                                    >
                                        Change
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="otp">Enter OTP</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="text-center text-lg tracking-widest"
                                    />
                                </div>
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90"
                                    onClick={handleLogin}
                                    disabled={otp.length !== 6 || isLoading}
                                >
                                    {isLoading ? "Verifying..." : "Login"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <button
                                    className="w-full text-sm text-muted-foreground hover:text-primary"
                                    onClick={handleSendOtp}
                                    disabled={isLoading}
                                >
                                    Resend OTP
                                </button>
                            </>
                        )}

                        <div className="text-center pt-4 border-t border-border">
                            <span className="text-sm text-muted-foreground">New to TriNetra? </span>
                            <button
                                className="text-sm text-primary hover:underline font-medium"
                                onClick={() => {
                                    setLoginOpen(false)
                                    resetRegForm()
                                    setRegisterOpen(true)
                                }}
                            >
                                Register here
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Register Dialog */}
            <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                                <Leaf className="h-5 w-5 text-primary-foreground" />
                            </div>
                            Register on TriNetra
                        </DialogTitle>
                        <DialogDescription>
                            Create your account to access agricultural intelligence tools.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-4">
                        {!regOtpSent ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="fullName"
                                            placeholder="Enter your full name"
                                            value={regForm.fullName}
                                            onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="regPhone">Phone Number</Label>
                                    <div className="flex gap-2">
                                        <div className="flex items-center px-3 bg-muted rounded-md border border-border text-sm text-muted-foreground">
                                            +91
                                        </div>
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="regPhone"
                                                type="tel"
                                                placeholder="Enter 10-digit number"
                                                value={regForm.phone}
                                                onChange={(e) => setRegForm({ ...regForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="state">State</Label>
                                        <Select
                                            value={regForm.state}
                                            onValueChange={(value) => setRegForm({ ...regForm, state: value, district: "" })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select state" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {indianStates.map((state) => (
                                                    <SelectItem key={state} value={state}>
                                                        {state}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="district">District</Label>
                                        <Input
                                            id="district"
                                            placeholder="Enter district"
                                            value={regForm.district}
                                            onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="village">Village/Town</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="village"
                                                placeholder="Enter village"
                                                value={regForm.village}
                                                onChange={(e) => setRegForm({ ...regForm, village: e.target.value })}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="landArea">Land Area (acres)</Label>
                                        <Input
                                            id="landArea"
                                            type="number"
                                            placeholder="e.g., 5"
                                            value={regForm.landArea}
                                            onChange={(e) => setRegForm({ ...regForm, landArea: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-primary hover:bg-primary/90"
                                    onClick={handleRegSendOtp}
                                    disabled={
                                        !regForm.fullName ||
                                        regForm.phone.length !== 10 ||
                                        !regForm.state ||
                                        !regForm.district ||
                                        isLoading
                                    }
                                >
                                    {isLoading ? "Sending OTP..." : "Continue"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="text-center text-sm text-muted-foreground mb-4">
                                    OTP sent to +91 {regForm.phone}
                                    <button
                                        className="text-primary hover:underline ml-2"
                                        onClick={() => setRegOtpSent(false)}
                                    >
                                        Change
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="regOtp">Enter OTP</Label>
                                    <Input
                                        id="regOtp"
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={regOtp}
                                        onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="text-center text-lg tracking-widest"
                                    />
                                </div>
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90"
                                    onClick={handleRegister}
                                    disabled={regOtp.length !== 6 || isLoading}
                                >
                                    {isLoading ? "Creating Account..." : "Complete Registration"}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <button
                                    className="w-full text-sm text-muted-foreground hover:text-primary"
                                    onClick={handleRegSendOtp}
                                    disabled={isLoading}
                                >
                                    Resend OTP
                                </button>
                            </>
                        )}

                        <div className="text-center pt-4 border-t border-border">
                            <span className="text-sm text-muted-foreground">Already have an account? </span>
                            <button
                                className="text-sm text-primary hover:underline font-medium"
                                onClick={() => {
                                    setRegisterOpen(false)
                                    resetLoginForm()
                                    setLoginOpen(true)
                                }}
                            >
                                Login here
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}