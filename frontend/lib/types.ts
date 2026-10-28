// Common translation types used across components
export interface CommonTranslations {
  live: string
  updated: string
  connected: string
}

export interface SidebarTranslations {
  dashboard: string
  market: string
  soil: string
  credit: string
  home: string
  system: string
}

export interface CreditTranslations {
  title: string
  subtitle: string
  loc_details: string
  btn_detect: string
  lbl_lat: string
  lbl_lng: string
  lbl_yield: string
  btn_calc: string
  res_title: string
  res_score: string
  res_analysis: string
  drag_hint: string
  status_elig: string
  status_review: string
  status_risk: string
}

export interface MarketTranslations {
  title: string
  subtitle: string
  lbl_crop: string
  lbl_state: string
  lbl_market: string
  lbl_date: string
  lbl_qty: string
  btn_run: string
  btn_processing: string
  res_forecast: string
  res_unit: string
  res_rec: string
  empty_title: string
  empty_subtitle: string
  crops: Record<string, string>
}

export interface SoilTranslations {
  title: string
  subtitle: string
  [key: string]: string
}

export interface DashboardTranslations {
  [key: string]: string | Record<string, string>
}

export interface LandingTranslations {
  [key: string]: string | Record<string, string>
}
