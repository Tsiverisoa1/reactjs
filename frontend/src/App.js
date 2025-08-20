"use client"
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import IpList from "./components/IpList"
import Login from "./components/Login"
import HistoryView from "./components/HistoryView"
import ReservationForm from "./components/ReservationForm"
import Dashboard from "./components/Dashboard"
import SubnetManager from "./components/SubnetManager"

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/login" replace />
}

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("token")
    window.dispatchEvent(new Event("storage"))
    navigate("/login")
  }

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/ips", label: "Liste des IP", icon: "🌐" },
    { path: "/subnet", label: "Sous-réseau", icon: "🔗" },
    { path: "/reservation", label: "Réservation", icon: "📝" },
    { path: "/history", label: "Historique", icon: "📋" },
  ]

  return (
    <div className="w-64 bg-white/80 border-r border-gray-200 h-screen flex flex-col backdrop-blur-sm">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          DHCP Manager
        </h1>
        <p className="text-sm text-gray-500 mt-1">Administration réseau</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium 
                  transition-all duration-300 transform
                  ${
                    location.pathname === item.path
                      ? "bg-purple-100 text-purple-800 scale-105 shadow-md"
                      : "text-gray-700 hover:bg-purple-50 hover:text-purple-700 hover:scale-105 hover:shadow-md"
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">A</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Administrateur</p>
            <p className="text-xs text-gray-500">admin@react</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-pink-500 text-white px-4 py-2 rounded-lg font-medium text-sm
                     transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:bg-pink-600 active:scale-95"
        >
          Déconnexion
        </button>
      </div>
    </div>
  )
}

function Header() {
  const location = useLocation()

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard"
      case "/ips":
        return "Gestion des adresses IP"
      case "/subnet":
        return "Gestion des sous-réseaux"
      case "/reservation":
        return "Réservations DHCP"
      case "/history":
        return "Historique des actions"
      default:
        return "DHCP Manager"
    }
  }

  return (
    <header className="bg-white/80 border-b border-gray-200 px-6 py-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Gérez efficacement votre infrastructure réseau</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-purple-600">Projet 11 L2ASR</span>
          </div>
        </div>
      </div>
    </header>
  )
}

function AppLayout({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"))

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem("token"))
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  if (!token) {
    return children
  }

  return (
    <div className="flex h-screen bg-[#F7F5FB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/ips" element={<PrivateRoute><IpList /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryView /></PrivateRoute>} />
          <Route path="/reservation" element={<PrivateRoute><ReservationForm /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/subnet" element={<PrivateRoute><SubnetManager /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App
