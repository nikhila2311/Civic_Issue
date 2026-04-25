import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL
const STATUS_COLOR = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981' }
const CAT_ICONS    = { pothole: '🕳️', streetlight: '💡', garbage: '🗑️', water: '💧', other: '📋' }

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60)    return `${s}s ago`
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function PublicDashboard() {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const [issues, setIssues]         = useState([])
  const [analytics, setAnalytics]   = useState({})
  const [filter, setFilter]         = useState({ status: '', category: '' })
  const [loading, setLoading]       = useState(true)
  const [view, setView]             = useState('map')
  const [selected, setSelected]     = useState(null)

  useEffect(() => {
    fetchIssues()
    fetchAnalytics()
  }, [])

  const fetchIssues = async (f = filter) => {
    try {
      const params = {}
      if (f.status)   params.status   = f.status
      if (f.category) params.category = f.category
      const res = await axios.get(`${API}/api/admin/issues`, { params })
      setIssues(res.data.issues || [])
    } catch {}
    finally { setLoading(false) }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/analytics`)
      setAnalytics(res.data)
    } catch {}
  }

  const handleFilter = (key, val) => {
    const f = { ...filter, [key]: val }
    setFilter(f); fetchIssues(f)
  }

  const resolutionRate = analytics.total
    ? Math.round((analytics.resolved / analytics.total) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 
              flex items-center justify-center text-white font-black text-sm">C</div>
            <span className="font-black gradient-text text-lg">CivicPulse</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">My Issues</button>
                <button onClick={() => navigate('/report')} className="btn-primary text-sm px-4 py-2 rounded-lg shadow-none">+ Report</button>
              </>
            ) : (
              <button onClick={() => navigate('/auth')} className="btn-primary text-sm px-4 py-2 rounded-lg shadow-none">Sign In</button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Public Issue Map</h1>
          <p className="text-slate-400 mt-1">All reported civic issues in the city — live and transparent</p>
        </div>

        {/* ANALYTICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '📋', label: 'Total Issues',   val: analytics.total       || 0, color: 'text-slate-700' },
            { icon: '⏳', label: 'Pending',         val: analytics.pending     || 0, color: 'text-amber-600' },
            { icon: '🔄', label: 'In Progress',     val: analytics.in_progress || 0, color: 'text-blue-600' },
            { icon: '✅', label: 'Resolved',         val: analytics.resolved    || 0, color: 'text-emerald-600' },
          ].map((s, i) => (
            <div key={i} className="card card-hover text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className={`text-2xl font-black ${s.color}`}>{s.val}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* RESOLUTION BAR */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-slate-900">City Resolution Rate</p>
              <p className="text-sm text-slate-400">Target: resolve all issues within 7 days</p>
            </div>
            <span className={`text-2xl font-black ${resolutionRate >= 70 ? 'text-emerald-600' : resolutionRate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
              {resolutionRate}%
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${resolutionRate}%`,
                background: resolutionRate >= 70
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : resolutionRate >= 40
                    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                    : 'linear-gradient(90deg, #ef4444, #dc2626)'
              }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0%</span>
            <span>Target: 100%</span>
          </div>
        </div>

        {/* FILTERS + VIEW TOGGLE */}
        <div className="flex flex-wrap gap-3 mb-5 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <select className="input w-auto text-sm py-2 px-3"
              value={filter.status} onChange={e => handleFilter('status', e.target.value)}>
              <option value="">All Statuses</option>
              <option value="pending">⏳ Pending</option>
              <option value="in_progress">🔄 In Progress</option>
              <option value="resolved">✅ Resolved</option>
            </select>
            <select className="input w-auto text-sm py-2 px-3"
              value={filter.category} onChange={e => handleFilter('category', e.target.value)}>
              <option value="">All Categories</option>
              <option value="pothole">🕳️ Pothole</option>
              <option value="streetlight">💡 Streetlight</option>
              <option value="garbage">🗑️ Garbage</option>
              <option value="water">💧 Water</option>
            </select>
            <span className="text-sm text-slate-400 self-center font-medium">
              {issues.length} issues
            </span>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
            {['map', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                  ${view === v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                {v === 'map' ? '🗺️ Map' : '📋 List'}
              </button>
            ))}
          </div>
        </div>

        {/* MAP VIEW */}
        {view === 'map' && (
          <div className="card p-0 overflow-hidden" style={{ height: '520px' }}>
            <MapContainer center={[17.3850, 78.4867]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap contributors' />
              {issues.map(issue => (
                <CircleMarker key={issue.id}
                  center={[issue.latitude, issue.longitude]}
                  radius={10} fillColor={STATUS_COLOR[issue.status]}
                  color="white" weight={2} fillOpacity={0.9}
                  eventHandlers={{ click: () => setSelected(issue) }}>
                  <Popup>
                    <div className="text-sm">
                      <strong className="font-mono">{issue.ticket_id}</strong><br />
                      {CAT_ICONS[issue.category]} {issue.category}<br />
                      <span className="text-gray-500 text-xs">{issue.description?.slice(0, 60)}...</span><br />
                      <button onClick={() => navigate(`/track/${issue.ticket_id}`)}
                        className="text-blue-600 font-semibold text-xs mt-1 hover:underline">
                        Track this issue →
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : issues.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-400">No issues found for the selected filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {issues.map(issue => {
                const sc = STATUS_COLOR[issue.status]
                return (
                  <div key={issue.id}
                    className="card card-hover cursor-pointer group p-0 overflow-hidden"
                    onClick={() => navigate(`/track/${issue.ticket_id}`)}>
                    {issue.photo_url && (
                      <div className="h-32 overflow-hidden">
                        <img src={issue.photo_url} alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-xs text-slate-400">{issue.ticket_id}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: sc + '20', color: sc }}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 line-clamp-2 mb-2">
                        {issue.description}
                      </p>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{CAT_ICONS[issue.category]} {issue.category}</span>
                        <span>{timeAgo(issue.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    </div>
  )
}