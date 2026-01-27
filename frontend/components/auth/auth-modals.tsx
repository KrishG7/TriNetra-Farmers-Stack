"use client"

import { useState } from "react"
import { X, Leaf, ArrowRight, Phone, User, MapPin } from "lucide-react"
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
import { API_BASE_URL } from "@/lib/config"

interface AuthModalsProps {
  isLoginOpen: boolean
  isRegisterOpen: boolean
  onCloseLogin: () => void
  onCloseRegister: () => void
  onSwitchToRegister: () => void
  onSwitchToLogin: () => void
  onAuthSuccess: () => void
}

const states = [
  "Andhra Pradesh",
  "Bihar",
  "Gujarat",
  "Haryana",
  "Karnataka",
  "Madhya Pradesh",
  "Maharashtra",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
]

const districtsByState: Record<string, string[]> = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "Guntur", "Krishna", "Kurnool", "Prakasam", "Vizianagaram"],
  "Bihar": ["Bhagalpur", "Gaya", "Muzaffarpur", "Patna", "Purnia", "Samastipur"],
  "Gujarat": ["Ahmedabad", "Amreli", "Banaskantha", "Bharuch", "Junagadh", "Rajkot", "Surat"],
  "Haryana": ["Ambala", "Faridabad", "Gurugram", "Hisar", "Karnal", "Panipat", "Rohtak"],
  "Karnataka": ["Bagalkot", "Bangalore Rural", "Belgaum", "Bellary", "Dharwad", "Mysore", "Shimoga"],
  "Madhya Pradesh": ["Bhopal", "Gwalior", "Indore", "Jabalpur", "Rewa", "Sagar", "Ujjain"],
  "Maharashtra": ["Ahmednagar", "Aurangabad", "Kolhapur", "Nagpur", "Nashik", "Pune", "Solapur"],
  "Punjab": ["Amritsar", "Bathinda", "Faridkot", "Jalandhar", "Ludhiana", "Patiala", "Sangrur"],
  "Rajasthan": ["Ajmer", "Alwar", "Bikaner", "Jaipur", "Jodhpur", "Kota", "Udaipur"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Erode", "Madurai", "Salem", "Thanjavur", "Tiruchirappalli"],
  "Telangana": ["Adilabad", "Hyderabad", "Karimnagar", "Khammam", "Nalgonda", "Nizamabad", "Warangal"],
  "Uttar Pradesh": ["Agra", "Allahabad", "Gorakhpur", "Kanpur", "Lucknow", "Meerut", "Varanasi"],
  "West Bengal": ["Bardhaman", "Darjeeling", "Hooghly", "Howrah", "Kolkata", "Malda", "Murshidabad"],
}

export function AuthModals({
  isLoginOpen,
  isRegisterOpen,
  onCloseLogin,
  onCloseRegister,
  onSwitchToRegister,
  onSwitchToLogin,
  onAuthSuccess,
}: AuthModalsProps) {
  // Login state
  const [loginPhone, setLoginPhone] = useState("")
  const [loginOtp, setLoginOtp] = useState("")
  const [loginOtpSent, setLoginOtpSent] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [registerStep, setRegisterStep] = useState(1)
  const [registerData, setRegisterData] = useState({
    fullName: "",
    phone: "",
    state: "",
    district: "",
    village: "",
    landArea: "",
    otp: "",
  })
  const [registerOtpSent, setRegisterOtpSent] = useState(false)
  const [registerLoading, setRegisterLoading] = useState(false)

  // --- LOGIN LOGIC ---

  const handleSendLoginOtp = async () => {
    if (loginPhone.length !== 10) return
    setLoginLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone })
      })

      if (!res.ok) {
        const err = await res.json()
        alert(err.detail || "User not found. Please Register first!")
        setLoginLoading(false)
        return
      }

      setLoginOtpSent(true)
    } catch (e) {
      alert("Connection error. Make sure backend is running!")
    } finally {
      setLoginLoading(false)
    }
  }

  const handleVerifyLoginOtp = async () => {
    if (loginOtp.length !== 6) return
    setLoginLoading(true)

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: loginPhone, otp: loginOtp })
      })

      if (!res.ok) {
        alert("Invalid OTP (Hint: Try 123456)")
        setLoginLoading(false)
        return
      }

      const backendData = await res.json()

      const userData = {
        ...backendData,
        name: backendData.name || backendData.fullName || "User"
      }

      localStorage.setItem("trinetra_user", JSON.stringify(userData))

      onAuthSuccess()
      onCloseLogin()
      window.location.href = "/dashboard"
    } catch (e) {
      alert("Verification failed")
    } finally {
      setLoginLoading(false)
    }
  }

  // --- REGISTER LOGIC ---

  const handleSendRegisterOtp = () => {
    if (registerData.phone.length !== 10) return
    setRegisterLoading(true)
    // Simulate Sending OTP (We trust the user for the demo)
    setTimeout(() => {
      setRegisterOtpSent(true)
      setRegisterLoading(false)
    }, 1000)
  }

  const handleVerifyRegisterOtp = async () => {
    if (registerData.otp.length !== 6) return
    setRegisterLoading(true)

    // 1. Prepare data for backend
    const payload = {
      name: registerData.fullName,
      phone: registerData.phone,
      state: registerData.state,
      district: registerData.district,
      language: "en" // Default to English for now
    }

    try {
      // 2. 🚀 ACTUALLY CALL THE BACKEND TO SAVE DATA
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorData = await res.json()
        alert("Registration Failed: " + (errorData.detail || "Unknown error"))
        setRegisterLoading(false)
        return
      }

      // 3. Backend saved it! Now save to Browser for UI.
      const savedUser = await res.json()
      
      const userDataForLocal = {
        name: savedUser.name,
        phone: savedUser.phone,
        state: savedUser.state,
        district: savedUser.district
      }
      
      localStorage.setItem("trinetra_user", JSON.stringify(userDataForLocal))

      setRegisterLoading(false)
      onAuthSuccess()
      onCloseRegister()
      
      // Reset state
      setRegisterStep(1)
      setRegisterData({
        fullName: "",
        phone: "",
        state: "",
        district: "",
        village: "",
        landArea: "",
        otp: "",
      })
      setRegisterOtpSent(false)

      // 4. Reload page to show logged in state
      window.location.href = "/dashboard"

    } catch (error) {
      console.error(error)
      alert("Network Error: Could not connect to backend.")
      setRegisterLoading(false)
    }
  }

  const handleCloseLogin = () => {
    onCloseLogin()
    setLoginPhone("")
    setLoginOtp("")
    setLoginOtpSent(false)
  }

  const handleCloseRegister = () => {
    onCloseRegister()
    setRegisterStep(1)
    setRegisterData({
      fullName: "",
      phone: "",
      state: "",
      district: "",
      village: "",
      landArea: "",
      otp: "",
    })
    setRegisterOtpSent(false)
  }

  const canProceedStep1 = registerData.fullName && registerData.phone.length === 10
  const canProceedStep2 = registerData.state && registerData.district

  if (!isLoginOpen && !isRegisterOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={() => {
          if (isLoginOpen) handleCloseLogin()
          if (isRegisterOpen) handleCloseRegister()
        }}
      />

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-background rounded-2xl shadow-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseLogin}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Welcome Back</h2>
                <p className="text-sm text-muted-foreground">Login to your TriNetra account</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-phone">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="pl-10"
                    disabled={loginOtpSent}
                  />
                </div>
              </div>

              {!loginOtpSent ? (
                <Button
                  onClick={handleSendLoginOtp}
                  disabled={loginPhone.length !== 10 || loginLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loginLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="login-otp">Enter OTP</Label>
                    <Input
                      id="login-otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="text-center text-lg tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      OTP sent to +91 {loginPhone}
                    </p>
                  </div>
                  <Button
                    onClick={handleVerifyLoginOtp}
                    disabled={loginOtp.length !== 6 || loginLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {loginLoading ? "Verifying..." : "Verify & Login"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => {
                      setLoginOtpSent(false)
                      setLoginOtp("")
                    }}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    Change phone number
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                {"Don't have an account? "}
                <button
                  onClick={() => {
                    handleCloseLogin()
                    onSwitchToRegister()
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Register now
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="bg-background rounded-2xl shadow-xl max-w-md w-full p-6 relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseRegister}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Create Account</h2>
                <p className="text-sm text-muted-foreground">Join TriNetra for free</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex-1 flex items-center gap-2">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${registerStep >= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`flex-1 h-1 rounded-full transition-colors ${registerStep > step ? "bg-primary" : "bg-muted"
                        }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Personal Info */}
            {registerStep === 1 && (
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={registerData.fullName}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, fullName: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-phone"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={registerData.phone}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => setRegisterStep(2)}
                  disabled={!canProceedStep1}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Location Info */}
            {registerStep === 2 && (
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Location Details</h3>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select
                    value={registerData.state}
                    onValueChange={(value) =>
                      setRegisterData({ ...registerData, state: value, district: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Select
                    value={registerData.district}
                    onValueChange={(value) =>
                      setRegisterData({ ...registerData, district: value })
                    }
                    disabled={!registerData.state}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your district" />
                    </SelectTrigger>
                    <SelectContent>
                      {(districtsByState[registerData.state] || []).map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village/Town (Optional)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="village"
                      placeholder="Enter your village or town"
                      value={registerData.village}
                      onChange={(e) =>
                        setRegisterData({ ...registerData, village: e.target.value })
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landArea">Land Area in Acres (Optional)</Label>
                  <Input
                    id="landArea"
                    type="number"
                    placeholder="e.g., 5"
                    value={registerData.landArea}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, landArea: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setRegisterStep(1)}
                    className="flex-1 bg-transparent"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setRegisterStep(3)}
                    disabled={!canProceedStep2}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {registerStep === 3 && (
              <div className="space-y-4">
                <h3 className="font-medium text-foreground">Verify Your Number</h3>
                <p className="text-sm text-muted-foreground">
                  {"We'll send a verification code to +91 "}{registerData.phone}
                </p>

                {!registerOtpSent ? (
                  <Button
                    onClick={handleSendRegisterOtp}
                    disabled={registerLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {registerLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="register-otp">Enter OTP</Label>
                      <Input
                        id="register-otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={registerData.otp}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                          })
                        }
                        className="text-center text-lg tracking-widest"
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        OTP sent to +91 {registerData.phone}
                      </p>
                    </div>
                    <Button
                      onClick={handleVerifyRegisterOtp}
                      disabled={registerData.otp.length !== 6 || registerLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      {registerLoading ? "Creating Account..." : "Verify & Create Account"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <button
                      onClick={() => setRegisterOtpSent(false)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground"
                    >
                      Resend OTP
                    </button>
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setRegisterStep(2)
                    setRegisterOtpSent(false)
                  }}
                  className="w-full bg-transparent"
                >
                  Back
                </Button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  onClick={() => {
                    handleCloseRegister()
                    onSwitchToLogin()
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}