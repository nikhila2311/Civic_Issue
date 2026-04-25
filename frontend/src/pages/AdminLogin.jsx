import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('admin@civicpulse.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [showPass, setShowPass] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('adminToken')) navigate('/admin/dashboard')
  }, [])

  const handleLogin = async () => {
    if (!email || !password) return setError('Please fill all fields')
    setLoading(true); setError(null)
    try {
      const res = await axios.post(`${API}/api/admin/login`, { email, password })
      localStorage.setItem('adminToken', res.data.token)
      navigate('/admin/dashboard')
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-black via-[#070b14] to-black transition-all duration-300 relative overflow-hidden">
      {/* Cinematic blurred lights */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[350px] rounded-full bg-blue-700/5 blur-3xl"></div>
        <div className="absolute bottom-[5%] left-[15%] w-[340px] h-[200px] rounded-full bg-[#1e3a8a]/10 blur-3xl"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[420px] h-[250px] rounded-full bg-[#6366f1]/5 blur-2xl"></div>
        <div className="absolute top-1/2 left-2/3 w-[280px] h-[180px] bg-blue-400/3 rounded-full blur-2xl"></div>
      </div>
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 40%, rgba(37,99,235,0.12) 0%, transparent 55%),
                              radial-gradient(circle at 70% 70%, rgba(124,58,237,0.08) 0%, transparent 62%)`
          }} />
        <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }} />
        {/* Soft glassy overlay for cinematic blur */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-black/10 to-black/10 backdrop-blur-xl pointer-events-none z-0"></div>
        <div className="relative z-10 flex flex-col justify-between p-14 w-full h-full min-h-[680px] animate-fadein transition-all duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative">
              <div className="absolute -inset-2 blur-xl bg-blue-500/30 rounded-2xl"></div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-700/70 via-violet-900/90 to-gray-900/90 border border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-700/30 transition-all">
                C
              </div>
            </div>
            <span className="text-white/90 font-black text-2xl tracking-tight drop-shadow-md">CivicPulse</span>
          </div>
          <div className="animate-fadein-smooth">
            <h2 className="text-4xl font-black text-white mb-4 leading-tight drop-shadow">
              Manage your city's<br />
              <span className="text-blue-400">civic issues</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              View reported issues on a live map, update resolution status, and track city-wide analytics.
            </p>
            <div className="flex flex-col gap-3 mt-8">
              {['Live issue map with GPS pins', 'AI-powered classification display', 'Real-time status updates'].map((f, i) => (
                <div key={i} className="flex items-center gap-3 transition-all duration-300">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shadow-[0_2px_10px_0_rgba(16,185,129,0.10)]">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-white/60 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-white/20 text-sm"></p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8 bg-transparent transition-all duration-300">
        <div className="
          w-full max-w-sm relative z-10
          bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
          shadow-[0_8px_40px_rgba(0,0,0,0.60)]
          p-8 animate-fadein-smooth hover:shadow-[0_12px_50px_rgba(37,99,235,0.09)] transition-all duration-300 hover:scale-[1.02]">
          {/* Blurred glow behind card */}
          <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-[85%] h-40 bg-blue-400/3 rounded-full blur-2xl z-[-1]" />
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="relative">
              <div className="absolute -inset-2 blur-2xl bg-blue-500/5 rounded-2xl"></div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/80 via-violet-700/80 to-gray-800/80 border border-white/20 flex items-center justify-center text-white font-black text-xl shadow">
                C
              </div>
            </div>
            <span className="font-black bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent text-xl">CivicPulse</span>
          </div>

          <h1 className="text-2xl font-black text-white mb-1 transition-all duration-300 drop-shadow">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8 transition-all duration-300">Sign in to your admin dashboard</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-5 text-sm text-red-300 font-medium shadow shadow-red-900/10 transition-all duration-300">
              <span className="text-base">⚠️</span> {error}
            </div>
          )}

          <div className="flex flex-col gap-4 transition-all duration-300">
            <div>
              <label className="label text-gray-300 font-medium">Email Address</label>
              <input
                className="input bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg w-full mt-1 py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                type="email"
                value={email}
                placeholder="Email"
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="label text-gray-300 font-medium">Password</label>
              <div className="relative">
                <input
                  className="input pr-12 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg w-full mt-1 py-3 px-4 outline-none focus:ring-2 focus:ring-white/20 transition-all duration-300"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 text-xl transition-all duration-300"
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="
                w-full py-3.5 rounded-xl mt-2
                bg-gradient-to-r from-gray-800 to-gray-700
                hover:from-gray-700 hover:to-gray-600
                shadow-md hover:shadow-lg
                transition-all duration-300 hover:scale-[1.02]
                text-white font-semibold flex items-center justify-center gap-2 text-lg
                disabled:opacity-60 disabled:cursor-not-allowed"
              style={{letterSpacing: 0.05}}
            >
              {loading ? (
                <>
                  <span className="mr-2 animate-spin border-2 border-blue-400 border-t-transparent rounded-full w-5 h-5 inline-block" />
                  Signing in...
                </>
              ) : (
                <>🔐 Sign In to Dashboard</>
              )}
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="
              btn-ghost w-full mt-4 text-sm text-gray-400 hover:text-white transition-all duration-300 py-2
            "
          >
            ← Back to Home
          </button>

          <p className="text-center text-xs text-gray-500 mt-8 tracking-wide">
            Authorized personnel only · CivicPulse Admin Portal
          </p>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fadein {
            animation: fadein 0.9s cubic-bezier(0.42,0,0.58,1) both;
          }
          .animate-fadein-smooth {
            animation: fadein 1.1s cubic-bezier(0.41,0.73,0.58,1.0) both;
          }
          @keyframes fadein {
            from { opacity: 0; transform: translateY(34px) scale(0.96);}
            to   { opacity: 1; transform: translateY(0) scale(1);}
          }
        `}
      </style>
    </div>
  )
}