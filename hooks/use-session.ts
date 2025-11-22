"use client"

import { useRef, useCallback } from "react"

const SESSION_KEY = "loyaltySessionToken"
const INACTIVITY_TIMEOUT = 60 * 60 * 1000 // 1 hour in milliseconds

export function useSession() {
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Create session
  const createSession = useCallback(() => {
    const sessionToken = `session_${Date.now()}_${Math.random()}`
    sessionStorage.setItem(SESSION_KEY, sessionToken)
  }, [])

  // Clear session
  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
    }
  }, [])

  // Check if session exists
  const isSessionValid = useCallback(() => {
    return sessionStorage.getItem(SESSION_KEY) !== null
  }, [])

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(
    (onSessionExpire: () => void) => {
      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }

      // Set new timer
      inactivityTimerRef.current = setTimeout(() => {
        clearSession()
        onSessionExpire()
      }, INACTIVITY_TIMEOUT)
    },
    [clearSession],
  )

  return {
    createSession,
    clearSession,
    isSessionValid,
    resetInactivityTimer,
  }
}
