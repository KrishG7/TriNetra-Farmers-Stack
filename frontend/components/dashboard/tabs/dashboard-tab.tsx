"use client"

import React from "react"
import { TrendingUp, Leaf, CreditCard, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

// --- TRANSLATIONS ---
const translations: Record<string, any> = {
  en: {
    title: "Agricultural Insights",
    subtitle: "Overview of the current agricultural trends and data",
    stats_market: "Market Predictions",
    stats_soil: "Soil Analyses",
    stats_credit: "Credit Scores",
    stats_system: "System Uptime",
    card_market_title: "Market Trends",
    card_market_sub: "Price Prediction AI",
    card_market_desc: "Predict crop prices using advanced ML models trained on historical market data.",
    card_market_action: "Launch Analysis",
    card_soil_title: "Soil Quality",
    card_soil_sub: "AI Agronomist",
    card_soil_desc: "Get personalized crop recommendations and fertilizer dosages based on soil composition.",
    card_soil_action: "Analyze Soil",
    card_credit_title: "Credit Analysis",
    card_credit_sub: "Satellite Scoring",
    card_credit_desc: "Calculate credit eligibility scores using satellite imagery and verification.",
    card_credit_action: "Calculate Score",
    news_title: "Latest News",
    news_1_title: "Corn Prices Expected to Rise",
    news_1_desc: "Market analysts predict an increase in corn prices due to supply constraints.",
    news_2_title: "Collaborative Farming Techniques",
    news_2_desc: "New techniques are emerging as farmers collaborate to enhance yield.",
    news_3_title: "Monsoon Forecast Update",
    news_3_desc: "IMD predicts above-normal rainfall for the upcoming season in northern regions."
  },
  hi: {
    title: "कृषि अंतर्दृष्टि",
    subtitle: "वर्तमान कृषि रुझानों और डेटा का अवलोकन",
    stats_market: "बाजार भविष्यवाणियाँ",
    stats_soil: "मृदा विश्लेषण",
    stats_credit: "क्रेडिट स्कोर",
    stats_system: "सिस्टम अपटाइम",
    card_market_title: "बाजार के रुझान",
    card_market_sub: "मूल्य भविष्यवाणी एआई",
    card_market_desc: "ऐतिहासिक बाजार डेटा का उपयोग करके फसल की कीमतों की भविष्यवाणी करें।",
    card_market_action: "विश्लेषण शुरू करें",
    card_soil_title: "मिट्टी की गुणवत्ता",
    card_soil_sub: "एआई कृषिविज्ञानी",
    card_soil_desc: "मिट्टी की संरचना के आधार पर फसल की सिफारिशें और उर्वरक खुराक प्राप्त करें।",
    card_soil_action: "मिट्टी का विश्लेषण करें",
    card_credit_title: "क्रेडिट विश्लेषण",
    card_credit_sub: "उपग्रह स्कोरिंग",
    card_credit_desc: "उपग्रह इमेजरी का उपयोग करके क्रेडिट पात्रता स्कोर की गणना करें।",
    card_credit_action: "स्कोर की गणना करें",
    news_title: "ताज़ा खबर",
    news_1_title: "मक्का की कीमतें बढ़ने की उम्मीद",
    news_1_desc: "बाजार विश्लेषकों का अनुमान है कि आपूर्ति की कमी के कारण मक्का की कीमतें बढ़ेंगी।",
    news_2_title: "सहयोगी खेती की तकनीकें",
    news_2_desc: "पैदावार बढ़ाने के लिए किसान सहयोग कर रहे हैं, नई तकनीकें उभर रही हैं।",
    news_3_title: "मानसून पूर्वानुमान अपडेट",
    news_3_desc: "आईएमडी ने उत्तरी क्षेत्रों में आगामी सीजन के लिए सामान्य से अधिक बारिश की भविष्यवाणी की है।"
  },
  pb: {
    title: "ਖੇਤੀਬਾੜੀ ਇਨਸਾਈਟਸ",
    subtitle: "ਮੌਜੂਦਾ ਖੇਤੀਬਾੜੀ ਰੁਝਾਨਾਂ ਅਤੇ ਡੇਟਾ ਦੀ ਸੰਖੇਪ ਜਾਣਕਾਰੀ",
    stats_market: "ਮਾਰਕੀਟ ਭਵਿੱਖਬਾਣੀਆਂ",
    stats_soil: "ਮਿੱਟੀ ਵਿਸ਼ਲੇਸ਼ਣ",
    stats_credit: "ਕ੍ਰੈਡਿਟ ਸਕੋਰ",
    stats_system: "ਸਿਸਟਮ ਅਪਟਾਈਮ",
    card_market_title: "ਮਾਰਕੀਟ ਰੁਝਾਨ",
    card_market_sub: "ਕੀਮਤ ਭਵਿੱਖਬਾਣੀ AI",
    card_market_desc: "ਇਤਿਹਾਸਕ ਮਾਰਕੀਟ ਡੇਟਾ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਫਸਲਾਂ ਦੀਆਂ ਕੀਮਤਾਂ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕਰੋ।",
    card_market_action: "ਵਿਸ਼ਲੇਸ਼ਣ ਸ਼ੁਰੂ ਕਰੋ",
    card_soil_title: "ਮਿੱਟੀ ਦੀ ਗੁਣਵੱਤਾ",
    card_soil_sub: "AI ਖੇਤੀਬਾੜੀ ਮਾਹਰ",
    card_soil_desc: "ਮਿੱਟੀ ਦੀ ਬਣਤਰ ਦੇ ਅਧਾਰ ਤੇ ਫਸਲਾਂ ਦੀਆਂ ਸਿਫਾਰਸ਼ਾਂ ਅਤੇ ਖਾਦ ਦੀਆਂ ਖੁਰਾਕਾਂ ਪ੍ਰਾਪਤ ਕਰੋ।",
    card_soil_action: "ਮਿੱਟੀ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
    card_credit_title: "ਕ੍ਰੈਡਿਟ ਵਿਸ਼ਲੇਸ਼ਣ",
    card_credit_sub: "ਸੈਟੇਲਾਈਟ ਸਕੋਰਿੰਗ",
    card_credit_desc: "ਸੈਟੇਲਾਈਟ ਚਿੱਤਰਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਕਰਜ਼ੇ ਦੀ ਯੋਗਤਾ ਸਕੋਰ ਦੀ ਗਣਨਾ ਕਰੋ।",
    card_credit_action: "ਸਕੋਰ ਦੀ ਗਣਨਾ ਕਰੋ",
    news_title: "ਤਾਜ਼ਾ ਖ਼ਬਰਾਂ",
    news_1_title: "ਮੱਕੀ ਦੀਆਂ ਕੀਮਤਾਂ ਵਧਣ ਦੀ ਉਮੀਦ",
    news_1_desc: "ਮਾਰਕੀਟ ਵਿਸ਼ਲੇਸ਼ਕਾਂ ਨੇ ਮੱਕੀ ਦੀਆਂ ਕੀਮਤਾਂ ਵਿੱਚ ਵਾਧੇ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕੀਤੀ ਹੈ।",
    news_2_title: "ਸਹਿਯੋਗੀ ਖੇਤੀ ਤਕਨੀਕਾਂ",
    news_2_desc: "ਝਾੜ ਵਧਾਉਣ ਲਈ ਕਿਸਾਨਾਂ ਦੇ ਸਹਿਯੋਗ ਨਾਲ ਨਵੀਆਂ ਤਕਨੀਕਾਂ ਸਾਹਮਣੇ ਆ ਰਹੀਆਂ ਹਨ।",
    news_3_title: "ਮਾਨਸੂਨ ਦੀ ਭਵਿੱਖਬਾਣੀ",
    news_3_desc: "IMD ਨੇ ਉੱਤਰੀ ਖੇਤਰਾਂ ਵਿੱਚ ਆਉਣ ਵਾਲੇ ਸੀਜ਼ਨ ਲਈ ਆਮ ਨਾਲੋਂ ਵੱਧ ਮੀਂਹ ਪੈਣ ਦੀ ਭਵਿੱਖਬਾਣੀ ਕੀਤੀ ਹੈ।"
  }
}

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  color: "green" | "gold" | "brown" | "success"
}

function StatCard({ title, value, change, changeType, icon, color }: StatCardProps) {
  const colorClasses = {
    green: "text-primary bg-primary/10",
    gold: "text-accent bg-accent/10",
    brown: "text-secondary-foreground bg-secondary",
    success: "text-success bg-success/10",
  }

  const changeColors = {
    positive: "text-success",
    negative: "text-destructive",
    neutral: "text-muted-foreground",
  }

  return (
    <div className="nature-card-elevated rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          <p className={`mt-1 text-sm flex items-center gap-1 ${changeColors[changeType]}`}>
            {changeType === "positive" && <ArrowUpRight className="h-4 w-4" />}
            {changeType === "negative" && <ArrowDownRight className="h-4 w-4" />}
            {change}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </div>
  )
}

export function DashboardTab() {
  const { language } = useLanguage()
  const t = translations[language] || translations["en"]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          {t.title}
        </h1>
        <p className="text-muted-foreground">
          {t.subtitle}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t.stats_market}
          value="1,247"
          change="+12.5% this week"
          changeType="positive"
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <StatCard
          title={t.stats_soil}
          value="856"
          change="+8.2% this week"
          changeType="positive"
          icon={<Leaf size={24} />}
          color="success"
        />
        <StatCard
          title={t.stats_credit}
          value="432"
          change="-2.1% this week"
          changeType="negative"
          icon={<CreditCard size={24} />}
          color="gold"
        />
        <StatCard
          title={t.stats_system}
          value="99.9%"
          change="All systems nominal"
          changeType="neutral"
          icon={<Activity size={24} />}
          color="brown"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Market Vision Card */}
        <div className="nature-card-elevated rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t.card_market_title}</h3>
              <p className="text-sm text-muted-foreground">{t.card_market_sub}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t.card_market_desc}
          </p>
          <div className="flex items-center gap-2 text-primary text-sm font-medium group-hover:underline">
            <span>{t.card_market_action}</span>
            <TrendingUp size={14} />
          </div>
        </div>

        {/* Soil Vision Card */}
        <div className="nature-card-elevated rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-success/10 p-3 group-hover:bg-success/20 transition-colors">
              <Leaf className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t.card_soil_title}</h3>
              <p className="text-sm text-muted-foreground">{t.card_soil_sub}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t.card_soil_desc}
          </p>
          <div className="flex items-center gap-2 text-success text-sm font-medium group-hover:underline">
            <span>{t.card_soil_action}</span>
            <Leaf size={14} />
          </div>
        </div>

        {/* Credit Vision Card */}
        <div className="nature-card-elevated rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-xl bg-accent/10 p-3 group-hover:bg-accent/20 transition-colors">
              <CreditCard className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t.card_credit_title}</h3>
              <p className="text-sm text-muted-foreground">{t.card_credit_sub}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t.card_credit_desc}
          </p>
          <div className="flex items-center gap-2 text-accent text-sm font-medium group-hover:underline">
            <span>{t.card_credit_action}</span>
            <CreditCard size={14} />
          </div>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="nature-card-elevated rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t.news_title}</h3>
        <div className="space-y-4">
          {[
            {
              title: t.news_1_title,
              description: t.news_1_desc,
              time: "2 hours ago",
            },
            {
              title: t.news_2_title,
              description: t.news_2_desc,
              time: "5 hours ago",
            },
            {
              title: t.news_3_title,
              description: t.news_3_desc,
              time: "1 day ago",
            },
          ].map((news, index) => (
            <div
              key={index}
              className="flex items-start gap-4 py-4 border-b border-border last:border-0 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="h-16 w-24 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Leaf className="h-6 w-6 text-primary/50" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground">{news.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{news.description}</p>
                <span className="text-xs text-muted-foreground mt-2 block">{news.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}