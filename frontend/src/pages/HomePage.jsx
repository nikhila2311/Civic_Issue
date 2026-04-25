import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL

export default function HomePage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, resolved: 0, pending: 0 })

  useEffect(() => {
    axios.get(`${API}/api/admin/analytics`).then(r => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
  <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 
        flex items-center justify-center text-white font-black text-sm">C</div>
      <span className="text-lg font-black gradient-text tracking-tight">CivicPulse</span>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={() => navigate('/public')} className="btn-ghost text-sm px-3 py-1.5">
        🗺️ Public Map
      </button>
      <button onClick={() => navigate('/track')} className="btn-ghost text-sm px-3 py-1.5">
        Track Issue
      </button>
      <button onClick={() => navigate('/auth')} className="btn-primary text-sm px-4 py-2 rounded-lg shadow-none">
        Get Started
      </button>
      <button onClick={() => navigate('/admin')} className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1">
        Admin
      </button>
    </div>
  </div>
</nav>

      {/* HERO */}
      <section className="relative overflow-hidden">

        {/* Base Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950" />

        {/* Radial Lights */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(124,58,237,0.15) 0%, transparent 50%),
                            radial-gradient(circle at 60% 80%, rgba(16,185,129,0.08) 0%, transparent 40%)`
        }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* ⭐ CENTER GLOW */}
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] 
        bg-blue-500/20 blur-[140px] rounded-full 
        -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        {/* ⭐ SIDE GLOW */}
        <div className="absolute top-20 right-20 w-[400px] h-[400px] 
        bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />

        {/* ⭐ NOISE TEXTURE */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none 
        bg-[url('https://www.transparenttextures.com/patterns/noise.png')]" />

        <div className="relative max-w-6xl mx-auto px-6 py-28 text-center">

          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-semibold uppercase tracking-widest mb-8 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Rockverse Hackathon 2026 · AI Domain
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Your City.<br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Your Voice.
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12">
            Report civic issues in 30 seconds. AI classifies them instantly.
            Track resolution in real time. Hold your city accountable.
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">

            {/* 🔥 PREMIUM PRIMARY CTA */}
            <button
              onClick={() => navigate('/report')}
              className="inline-flex items-center gap-2 px-8 py-4 
              bg-gradient-to-r from-blue-500 to-violet-600 
              text-white font-bold rounded-2xl text-base 
              shadow-[0_10px_40px_rgba(59,130,246,0.5)]
              hover:scale-105 hover:shadow-[0_15px_50px_rgba(59,130,246,0.7)] 
              transition-all duration-300"
            >
              📸 Report an Issue
            </button>

            {/* Secondary */}
            <button
              onClick={() => navigate('/track')}
              className="inline-flex items-center gap-2 px-8 py-4 
              bg-white/10 text-white font-semibold rounded-2xl text-base 
              border border-white/20 
              hover:bg-white/20 hover:scale-105 
              transition-all duration-300 backdrop-blur-sm"
            >
              🔍 Track Complaint
            </button>

          </div>

          {/* Floating stats */}
          <div className="flex flex-wrap gap-8 justify-center mt-20">
            {[
              { val: stats.total || '0', label: 'Issues Reported', color: 'from-blue-400 to-blue-600' },
              { val: stats.resolved || '0', label: 'Resolved', color: 'from-emerald-400 to-emerald-600' },
              { val: stats.pending || '0', label: 'Pending', color: 'from-amber-400 to-orange-500' },
              { val: '<2s', label: 'AI Response', color: 'from-violet-400 to-purple-600' },
            ].map((s, i) => (
              <div key={i} className="text-center animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`text-3xl font-black bg-gradient-to-b ${s.color} bg-clip-text text-transparent`}>
                  {s.val}
                </div>
                <div className="text-white/40 text-xs font-medium mt-1 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
<section className="py-24 px-6 bg-gradient-to-b from-slate-50 to-white">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-black text-slate-900">How CivicPulse Works</h2>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {["Snap & Submit", "AI Classifies", "Track & Resolve"].map((title, i) => (
        <div key={i} className="p-6 rounded-2xl bg-white shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all">
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
      ))}
    </div>
  </div>
</section>

{/* CTA */}
<section className="py-24 px-6 text-center">
  <button
    onClick={() => navigate('/report')}
    className="px-10 py-4 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-2xl shadow-xl hover:scale-105 transition"
  >
    Get Started →
  </button>
</section>

{/* FOOTER */}
<footer className="py-8 text-center text-slate-400">
  © 2026 CivicPulse
</footer>
    </div>
  )
}