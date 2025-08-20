"use client"

import { useState, useEffect } from "react"
import api from "../axiosConfig"

function ReservationForm() {
  const [formData, setFormData] = useState({ mac: "", ip: "", deviceName: "" })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [validationState, setValidationState] = useState({
    mac: null,
    ip: null,
    deviceName: null,
  })
  const [currentStep, setCurrentStep] = useState(1)

  const validateField = (name, value) => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/

    switch (name) {
      case "mac":
        return value ? (macRegex.test(value) ? "valid" : "invalid") : null
      case "ip":
        return value ? (ipRegex.test(value) ? "valid" : "invalid") : null
      case "deviceName":
        return value ? (value.length >= 2 ? "valid" : "invalid") : null
      default:
        return null
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    const validation = validateField(name, value)
    setValidationState((prev) => ({ ...prev, [name]: validation }))

    if (error) setError(null)
  }

  const validateForm = () => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/

    if (!macRegex.test(formData.mac)) {
      setError("Adresse MAC invalide (format: 00:14:22:01:23:45)")
      return false
    }
    if (formData.ip && !ipRegex.test(formData.ip)) {
      setError("Adresse IP invalide (format: 192.168.1.1)")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const payload = { mac: formData.mac, ip: formData.ip, deviceName: formData.deviceName }
      await api.post("/dhcp/reservations", payload)

      setSuccess(true)
      setTimeout(() => {
        setFormData({ mac: "", ip: "", deviceName: "" })
        setValidationState({ mac: null, ip: null, deviceName: null })
        setCurrentStep(1)
        setSuccess(false)
        setError(null)
      }, 2000)
    } catch (err) {
      console.error("Erreur réservation complète :", err.response)
      setError(err.response?.data?.message || "Erreur lors de la réservation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignIp = async () => {
    if (!formData.mac) {
      setError("Veuillez saisir l'adresse MAC pour attribuer une IP automatiquement")
      return
    }

    setIsLoading(true)
    try {
      const payload = { mac: formData.mac, deviceName: formData.deviceName }
      const res = await api.post("/dhcp/assign-ip", payload)
      setFormData({ ...formData, ip: res.data.ip })
      setValidationState((prev) => ({ ...prev, ip: "valid" }))
      setError(null)
      setCurrentStep(3)
    } catch (err) {
      console.error("Erreur assign-ip complète :", err.response)
      setError(err.response?.data?.message || "Erreur lors de l'attribution automatique")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (validationState.mac === "valid" && currentStep === 1) {
      setTimeout(() => setCurrentStep(2), 300)
    }
    if (validationState.ip === "valid" && currentStep === 2) {
      setTimeout(() => setCurrentStep(3), 300)
    }
  }, [validationState, currentStep])

  const getFieldIcon = (fieldName) => {
    const state = validationState[fieldName]
    if (state === "valid") return "✓"
    if (state === "invalid") return "✗"
    return ""
  }

  const getFieldBorderClass = (fieldName) => {
    const state = validationState[fieldName]
    if (state === "valid") return "border-green-500 ring-2 ring-green-200"
    if (state === "invalid") return "border-red-500 ring-2 ring-red-200"
    return "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
            Nouvelle Réservation DHCP
          </h1>
          <p className="text-purple-600 text-lg">Configuration intelligente avec validation en temps réel</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-purple-200 text-purple-800"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-20 h-1 mx-2 rounded-full transition-all duration-300 ${
                      currentStep > step ? "bg-purple-500" : "bg-purple-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-purple-700">
            <span>Adresse MAC</span>
            <span>Adresse IP</span>
            <span>Appareil</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-2xl p-8 transition-all duration-300">
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-600 font-semibold">Réservation créée avec succès !</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-red-600 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={`transition-all duration-500 ${currentStep >= 1 ? "opacity-100" : "opacity-50"}`}>
              <label className="block text-sm font-semibold text-purple-800 mb-3">Adresse MAC de l'appareil</label>
              <div className="relative">
                <input
                  name="mac"
                  placeholder="00:14:22:01:23:45"
                  value={formData.mac}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-4 bg-purple-50 border-2 rounded-2xl text-purple-900 placeholder-purple-400 transition-all duration-300 focus:outline-none ${getFieldBorderClass("mac")}`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span
                    className={`text-lg ${validationState.mac === "valid" ? "text-green-500" : validationState.mac === "invalid" ? "text-red-500" : "text-purple-400"}`}
                  >
                    {getFieldIcon("mac")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-purple-500 mt-2">Format requis: XX:XX:XX:XX:XX:XX</p>
            </div>

            {/* Même logique appliquée pour IP et DeviceName */}
            <div className={`transition-all duration-500 ${currentStep >= 2 ? "opacity-100" : "opacity-50"}`}>
              <label className="block text-sm font-semibold text-purple-800 mb-3">Adresse IP (optionnel)</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    name="ip"
                    placeholder="192.168.1.100"
                    value={formData.ip}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 bg-purple-50 border-2 rounded-2xl text-purple-900 placeholder-purple-400 transition-all duration-300 focus:outline-none ${getFieldBorderClass("ip")}`}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <span
                      className={`text-lg ${validationState.ip === "valid" ? "text-green-500" : validationState.ip === "invalid" ? "text-red-500" : "text-purple-400"}`}
                    >
                      {getFieldIcon("ip")}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAssignIp}
                  disabled={isLoading || !formData.mac}
                  className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Attribution...</span>
                    </div>
                  ) : (
                    "Auto-IP"
                  )}
                </button>
              </div>
              <p className="text-xs text-purple-500 mt-2">Laissez vide pour attribution automatique</p>
            </div>

            <div className={`transition-all duration-500 ${currentStep >= 3 ? "opacity-100" : "opacity-50"}`}>
              <label className="block text-sm font-semibold text-purple-800 mb-3">Nom de l'appareil</label>
              <div className="relative">
                <input
                  name="deviceName"
                  placeholder="Nom de la machine"
                  value={formData.deviceName}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 bg-purple-50 border-2 rounded-2xl text-purple-900 placeholder-purple-400 transition-all duration-300 focus:outline-none ${getFieldBorderClass("deviceName")}`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <span
                    className={`text-lg ${validationState.deviceName === "valid" ? "text-green-500" : validationState.deviceName === "invalid" ? "text-red-500" : "text-purple-400"}`}
                  >
                    {getFieldIcon("deviceName")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-purple-500 mt-2">Nom descriptif pour identifier l'appareil</p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-2xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Création en cours...</span>
                  </div>
                ) : success ? (
                  <div className="flex items-center justify-center gap-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Réservation créée !</span>
                  </div>
                ) : (
                  "Créer la Réservation"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full text-sm text-purple-700">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>La validation se fait automatiquement pendant la saisie</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReservationForm
