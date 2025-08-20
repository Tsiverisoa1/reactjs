"use client"

import { useState, useEffect } from "react"
import api from "../axiosConfig" // instance Axios globale
import { toast } from "react-toastify"

function IPList() {
  const [ips, setIps] = useState([])
  const [filteredIps, setFilteredIps] = useState([])
  const [statusFilter, setStatusFilter] = useState("")
  const [subnetFilter, setSubnetFilter] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchIps()
  }, [])

  const fetchIps = async () => {
    try {
      const res = await api.get("/dhcp/ips")
      setIps(res.data)
      setFilteredIps(res.data)
      toast.success("Adresses IP chargées avec succès !", { autoClose: 3000 })
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors du chargement des adresses IP", { autoClose: 5000 })
    }
  }

  useEffect(() => {
    let filtered = ips
    if (statusFilter) filtered = filtered.filter((ip) => ip.status === statusFilter)
    if (subnetFilter) filtered = filtered.filter((ip) => ip.cidr === subnetFilter)
    if (search)
      filtered = filtered.filter(
        (ip) =>
          ip.ip.includes(search) ||
          (ip.device_name && ip.device_name.toLowerCase().includes(search.toLowerCase())) ||
          (ip.reserved_device && ip.reserved_device.toLowerCase().includes(search.toLowerCase())) ||
          (ip.mac && ip.mac.toLowerCase().includes(search.toLowerCase())),
      )
    setFilteredIps(filtered)
  }, [statusFilter, subnetFilter, search, ips])

  const handleFreeIp = async (ip) => {
    if (!window.confirm(`Voulez-vous vraiment libérer l'IP ${ip} ?`)) return
    try {
      await api.post("/dhcp/free", { ip })
      toast.success(`IP ${ip} libérée avec succès !`, { autoClose: 3000 })
      fetchIps()
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la libération de l'IP", { autoClose: 5000 })
    }
  }

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case "free":
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`
      case "reserved":
        return `${baseClasses} bg-purple-100 text-purple-800 border border-purple-200`
      case "assigned":
        return `${baseClasses} bg-pink-100 text-pink-800 border border-pink-200`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border border-gray-200`
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "free":
        return (
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "reserved":
        return (
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        )
      case "assigned":
        return (
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        )
      default:
        return null
    }
  }

  const stats = {
    total: ips.length,
    free: ips.filter((ip) => ip.status === "free").length,
    reserved: ips.filter((ip) => ip.status === "reserved").length,
    assigned: ips.filter((ip) => ip.status === "assigned").length,
  }

  return (
    <div className="min-h-screen bg-[#F7F5FB] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Gestion des Adresses IP
          </h1>
          <p className="text-gray-600 text-lg">Surveillez et gérez efficacement votre infrastructure réseau</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total IPs</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2M9 9h6v6H9V9z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Free */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Libres</p>
                <p className="text-3xl font-bold text-green-600">{stats.free}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Reserved */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Réservées</p>
                <p className="text-3xl font-bold text-purple-600">{stats.reserved}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Assigned */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Assignées</p>
                <p className="text-3xl font-bold text-pink-600">{stats.assigned}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-full">
                <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 001.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z"
              />
            </svg>
            Filtres et Recherche
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Recherche</label>
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="IP, nom d'appareil ou MAC..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-purple-50 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-purple-50 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              >
                <option value="">Tous les statuts</option>
                <option value="free">Libre</option>
                <option value="reserved">Réservé</option>
                <option value="assigned">Assigné</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-800">Sous-réseau</label>
              <select
                value={subnetFilter}
                onChange={(e) => setSubnetFilter(e.target.value)}
                className="w-full px-4 py-3 bg-purple-50 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              >
                <option value="">Tous les sous-réseaux</option>
                {[...new Set(ips.map((ip) => ip.cidr).filter((cidr) => cidr))].map((cidr) => (
                  <option key={cidr} value={cidr}>
                    {cidr}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Liste IP */}
        {filteredIps.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-gray-200 shadow-sm text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m6 0V7a2 2 0 012 2v4M9 6.306V7a2 2 0 00-2-2v4.294"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune adresse IP trouvée</h3>
            <p className="text-gray-500">Essayez de modifier vos critères de recherche ou filtres.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Adresses IP ({filteredIps.length})</h2>
              <div className="text-sm text-gray-500">
                {filteredIps.length} sur {ips.length} adresses
              </div>
            </div>

            <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">IP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Device</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">MAC</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredIps.map((ip) => (
                    <tr key={ip.ip}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.ip}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.device_name || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ip.mac || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(ip.status)}>
                          {getStatusIcon(ip.status)}
                          {ip.status.charAt(0).toUpperCase() + ip.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {ip.status !== "free" && (
                          <button
                            onClick={() => handleFreeIp(ip.ip)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-pink-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                          >
                            Libérer
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default IPList
