import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('userToken')
    const saved = localStorage.getItem('userData')
    if (token && saved) {
      try { setUser(JSON.parse(saved)) } catch { logout() }
    }
    setLoading(false)
  }, [])

  const login = (token, userData) => {
    localStorage.setItem('userToken', token)
    localStorage.setItem('userData', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')
    setUser(null)
  }

  const getToken = () => localStorage.getItem('userToken')

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)