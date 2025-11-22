"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "@/components/login-page"
import { Dashboard } from "@/components/dashboard"
import { useSession } from "@/hooks/use-session"

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)
  const { createSession, clearSession, isSessionValid, resetInactivityTimer } = useSession()

  // Check session on mount
  useEffect(() => {
    if (isSessionValid()) {
      setIsAuthenticated(true)
    }
  }, [isSessionValid])

  // Setup event listeners for activity tracking when authenticated
  useEffect(() => {
    if (!isAuthenticated) return

    const handleUserActivity = () => {
      resetInactivityTimer(() => {
        handleSessionExpire()
      })
    }

    // Track user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"]
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity)
    })

    // Initial timer setup
    handleUserActivity()

    // Cleanup on page unload
    const handleBeforeUnload = () => {
      clearSession()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isAuthenticated, resetInactivityTimer, clearSession])

  const handleLogin = (credentials: { username: string; password: string }) => {
    createSession()
    setIsAuthenticated(true)
    setSessionExpired(false)
  }

  const handleLogout = () => {
    clearSession()
    setIsAuthenticated(false)
  }

  const handleSessionExpire = () => {
    setIsAuthenticated(false)
    setSessionExpired(true)
  }

  return (
    <div className="min-h-screen bg-background">
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} sessionExpired={sessionExpired} />
      ) : (
        <Dashboard onLogout={handleLogout} />
      )}
    </div>
  )
}
