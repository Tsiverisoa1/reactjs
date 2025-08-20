"use client"

import { useState, useEffect } from "react"
import api from "../axiosConfig"

function SubnetManager() {
  const [formData, setFormData] = useState({ cidr: "", description: "", startIp: "", endIp: "" })
  const [subnets, setSubnets] = useState([])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [validationState, setValidationState] = useState({
    cidr: null,
    startIp: null,
    endIp: null,
  })

  useEffect(() => {
    setIsLoading(true)
    api
      .get("/dhcp/subnets")
      .then((res) => {
        setSubnets(res.data)
        setIsLoading(false)
      })
      .catch((err) => {
        setError("Erreur lors du chargement des sous-réseaux : " + err.message)
        setIsLoading(false)
      })
  }, [])

  const validateField = (name, value) => {
    const cidrRegex = /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/

    switch (name) {
      case "cidr":
        return value ? (cidrRegex.test(value) ? "valid" : "invalid") : null
      case "startIp":
      case "endIp":
        return value ? (ipRegex.test(value) ? "valid" : "invalid") : null
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
    if (success) setSuccess(null)
  }

  // Même logique visuelle que ReservationForm.js (vert OK, rouge erreur, bleu focus)
  const getFieldBorderClass = (fieldName) => {
    const state = validationState[fieldName]
    if (state === "valid") return "border-green-500 ring-2 ring-green-200"
    if (state === "invalid") return "border-red-500 ring-2 ring-red-200"
    return "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  }

  const getFieldIcon = (fieldName) => {
    const state = validationState[fieldName]
    if (state === "valid") return "✓"
    if (state === "invalid") return "✗"
    return ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      await api.post("/dhcp/subnets", formData)
      setSuccess("Sous-réseau ajouté avec succès !")
      setFormData({ cidr: "", description: "", startIp: "", endIp: "" })
      setValidationState({ cidr: null, startIp: null, endIp: null })

      const res = await api.get("/dhcp/subnets")
      setSubnets(res.data)
      setIsLoading(false)
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'ajout du sous-réseau")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Gestionnaire de Sous-Réseaux
          </h1>
          <p className="text-purple-600 text-lg">Configurez et gérez vos sous-réseaux DHCP</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-2xl p-8 transition-all duration-300">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="text-red-600 font-medium">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-200 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-green-600 font-semibold">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-purple-800">CIDR *</label>
                <div className="relative">
                  <input
                    name="cidr"
                    placeholder="192.168.1.0/24"
                    value={formData.cidr}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 bg-purple-50 border-2 rounded-2xl text-purple-900 placeholder-purple-400 transition-all duration-300 focus:outline-none ${getFieldBorderClass("cidr")}`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                    <span className={`${validationState.cidr === "valid" ? "text-green-500" : validationState.cidr === "invalid" ? "text-red-500" : "text-purple-400"}`}>
                      {getFieldIcon("cidr")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-purple-800">Description</label>
                <input
                  name="description"
                  placeholder="Réseau principal"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-purple-50 border-2 border-gray-300 rounded-2xl text-purple-900 placeholder-purple-400 transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-purple-800">IP de Début</label>
                <div className="relative">
                  <input
                    name="startIp"
                    placeholder="192.168.1.10"
                    value={formData.startIp}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-purple-50 border-2 rounded-2xl text-purple-900 placeholder-purple-400 transition-all duration-300 focus:outline-none ${getFieldBorderClass("startIp")}`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                    <span className={`${validationState.startIp === "valid" ? "text-green-500" : validationState.startIp === "invalid" ? "text-red-500" : "text-purple-400"}`}>
                      {getFieldIcon("startIp")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-purple-800">IP de Fin</label>
                <div className="relative">
                  <input
                    name="endIp"
                    placeholder="192.168.1.50"
                    value={formData.endIp}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-purple-50 border-2 rounded-2xl text-purple-900 placeholder-purple-400 transition-all duration-300 focus:outline-none ${getFieldBorderClass("endIp")}`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg">
                    <span className={`${validationState.endIp === "valid" ? "text-green-500" : validationState.endIp === "invalid" ? "text-red-500" : "text-purple-400"}`}>
                      {getFieldIcon("endIp")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Ajout en cours...
                  </div>
                ) : (
                  "Ajouter le Sous-Réseau"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-2xl p-8 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-purple-800">Sous-Réseaux Configurés</h2>
            <p className="text-purple-600">
              {subnets.length} sous-réseau{subnets.length !== 1 ? "x" : ""}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          ) : subnets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-purple-600">Commencez par ajouter votre premier sous-réseau ci-dessus.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-purple-900">
                <thead>
                  <tr className="border-b border-purple-200 bg-purple-100/80">
                    <th className="py-4 px-4 text-left font-semibold">ID</th>
                    <th className="py-4 px-4 text-left font-semibold">CIDR</th>
                    <th className="py-4 px-4 text-left font-semibold">Description</th>
                    <th className="py-4 px-4 text-left font-semibold">Plage IP</th>
                  </tr>
                </thead>
                <tbody>
                  {subnets.map((subnet, index) => (
                    <tr
                      key={subnet.id}
                      className={`border-b border-purple-200/60 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-purple-50/40"
                      } hover:bg-purple-50`}
                    >
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          {subnet.id}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <code className="bg-purple-50 px-2 py-1 rounded text-sm font-mono text-purple-900">
                          {subnet.cidr}
                        </code>
                      </td>
                      <td className="py-4 px-4 text-purple-900">
                        {subnet.description || <span className="text-purple-500 italic">Aucune description</span>}
                      </td>
                      <td className="py-4 px-4">
                        {subnet.startIp && subnet.endIp ? (
                          <div className="flex items-center gap-2">
                            <code className="bg-purple-50 px-2 py-1 rounded text-sm font-mono">{subnet.startIp}</code>
                            <span className="text-purple-500">→</span>
                            <code className="bg-purple-50 px-2 py-1 rounded text-sm font-mono">{subnet.endIp}</code>
                          </div>
                        ) : (
                          <span className="text-purple-500 italic">Plage complète</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubnetManager
