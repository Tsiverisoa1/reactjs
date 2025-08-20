"use client"

import { useEffect, useState } from "react"
import api from "../axiosConfig" // <-- on utilise l'instance Axios configurée
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card"
import { Badge } from "./ui/Badge"

function Dashboard() {
  const [stats, setStats] = useState({ used: 0, free: 0, reserved: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .get("/dhcp/ips")
      .then((res) => {
        const ips = res.data
        const used = ips.filter((ip) => ip.status === "assigned").length
        const free = ips.filter((ip) => ip.status === "free").length
        const reserved = ips.filter((ip) => ip.status === "reserved").length
        setStats({ used, free, reserved })
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des données:", error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const total = stats.used + stats.free + stats.reserved

  return (
    <div className="min-h-screen bg-[#F7F5FB] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Tableau de Bord DHCP
          </h1>
          <p className="text-gray-600 text-lg">Gestion et surveillance des adresses IP</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Utilisées */}
              <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Adresses Utilisées</CardTitle>
                  <div className="h-4 w-4 rounded-full bg-pink-500"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-pink-600">{stats.used}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-pink-50 text-pink-700 hover:bg-pink-100">
                      {total > 0 ? Math.round((stats.used / total) * 100) : 0}%
                    </Badge>
                    <p className="text-xs text-gray-500">du total</p>
                  </div>
                </CardContent>
              </Card>

              {/* Libres */}
              <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Adresses Libres</CardTitle>
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.free}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                      {total > 0 ? Math.round((stats.free / total) * 100) : 0}%
                    </Badge>
                    <p className="text-xs text-gray-500">disponibles</p>
                  </div>
                </CardContent>
              </Card>

              {/* Réservées */}
              <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200 shadow-md bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Adresses Réservées</CardTitle>
                  <div className="h-4 w-4 rounded-full bg-purple-500"></div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{stats.reserved}</div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                      {total > 0 ? Math.round((stats.reserved / total) * 100) : 0}%
                    </Badge>
                    <p className="text-xs text-gray-500">réservées</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Résumé Global */}
            <Card className="border border-gray-200 shadow-md bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">Résumé Global</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total des adresses</span>
                  <span className="text-2xl font-bold text-gray-800">{total}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Utilisation</span>
                    <span>{total > 0 ? Math.round(((stats.used + stats.reserved) / total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div className="h-full flex">
                      <div
                        className="bg-pink-500 transition-all duration-1000 ease-out"
                        style={{ width: `${total > 0 ? (stats.used / total) * 100 : 0}%` }}
                      ></div>
                      <div
                        className="bg-purple-500 transition-all duration-1000 ease-out"
                        style={{ width: `${total > 0 ? (stats.reserved / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Utilisées: {stats.used}</span>
                    <span>Réservées: {stats.reserved}</span>
                    <span>Libres: {stats.free}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
