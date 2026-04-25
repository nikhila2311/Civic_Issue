import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL
const STATUS_COLOR = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981' }
const CAT_ICONS    = { pothole: '🕳️', streetlight: '💡', garbage: '🗑️', water: '💧', other: '📋' }

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
function getRemainingTime(deadline) {
  if (!deadline) return "No deadline";

  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return "⚠️ Overdue";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h left`;
}
export default function AdminDashboard() {
  const navigate = useNavigate()

  const token = localStorage.getItem('adminToken')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const [issues, setIssues]       = useState([])
  const [analytics, setAnalytics] = useState({})
  const [selected, setSelected]   = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [filter, setFilter]       = useState({ status: '', category: '' })
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState(false)
  const [toast, setToast]         = useState(null)
  const [afterImage, setAfterImage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchIssues = async (f = filter) => {
    try {
      const params = {}
      if (f.status) params.status = f.status
      if (f.category) params.category = f.category

      const res = await axios.get(`${API}/api/admin/issues`, { headers, params })
      setIssues(res.data.issues || [])
    } catch (err) {
      console.error("FETCH ISSUES ERROR:", err)
      navigate('/admin')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/analytics`, { headers })
      setAnalytics(res.data)
    } catch (err) {
      console.error("FETCH ANALYTICS ERROR:", err)
    }
  }

  const handleFilter = (key, val) => {
    const f = { ...filter, [key]: val }
    setFilter(f)
    fetchIssues(f)
  }

  const updateStatus = async () => {
    if (!newStatus || !selected) return

    setUpdating(true)
    try {
          const formData = new FormData();
          formData.append("status", newStatus);

          if (afterImage) {
            formData.append("afterImage", afterImage);
          }

          await axios.patch(
            `${API}/api/admin/issues/${selected.id}/status`,
            formData,
            {
              headers: {
                ...headers,
                "Content-Type": "multipart/form-data"
              }
            }
          );
                showToast('Status updated successfully!')
      setSelected(null)
      setNewStatus('')
      fetchIssues()
      fetchAnalytics()
    } catch (err) {
      console.error("UPDATE ERROR:", err)
      showToast('Update failed', 'error')
    } finally {
      setUpdating(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchIssues()
      await fetchAnalytics()
      setLoading(false)
    }
    loadData()
  }, [])

  const statusOptions = [
    { value: 'pending', label: '⏳ Pending' },
    { value: 'in_progress', label: '🔄 In Progress' },
    { value: 'resolved', label: '✅ Resolved' },
  ]

  // Analytics Cards
  const AnalyticsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 animate-fade-in">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl p-6 flex flex-col items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group">
        <span className="text-4xl font-extrabold text-blue-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.4)] transition-all duration-300">{analytics.total ?? 0}</span>
        <span className="text-xs font-semibold text-gray-300 mt-2 uppercase tracking-widest">Total</span>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl p-6 flex flex-col items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group">
        <span className="text-4xl font-extrabold text-amber-400 drop-shadow-[0_0_7px_rgba(251,191,36,0.28)] transition-all duration-300">{analytics.pending ?? 0}</span>
        <span className="text-xs font-semibold text-amber-300 mt-2 uppercase tracking-widest">Pending</span>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl p-6 flex flex-col items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group">
        <span className="text-4xl font-extrabold text-blue-400 drop-shadow-[0_0_7px_rgba(59,130,246,0.28)] transition-all duration-300">{analytics.in_progress ?? 0}</span>
        <span className="text-xs font-semibold text-blue-300 mt-2 uppercase tracking-widest">In Progress</span>
      </div>
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl p-6 flex flex-col items-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl group">
        <span className="text-4xl font-extrabold text-emerald-400 drop-shadow-[0_0_7px_rgba(16,185,129,0.24)] transition-all duration-300">{analytics.resolved ?? 0}</span>
        <span className="text-xs font-semibold text-emerald-300 mt-2 uppercase tracking-widest">Resolved</span>
      </div>
    </div>
  )

  let mapCenter = [28.61, 77.23]
  if (issues.length > 0) {
    const first = issues.find(i => i.latitude && i.longitude)
    if (first) mapCenter = [Number(first.latitude), Number(first.longitude)]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0f172a] to-black">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-4 border-white/20 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Status badge color mapping
  const statusBadgeClass = status => {
    if (status === "pending")      return "bg-yellow-500/20 text-yellow-300 shadow-yellow-500/20";
    if (status === "resolved")     return "bg-emerald-500/20 text-emerald-300 shadow-emerald-500/25";
    if (status === "in_progress")  return "bg-blue-500/20 text-blue-300 shadow-blue-500/20";
    return "bg-gray-700 text-gray-300"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#0f172a] to-black">
      {/* NAVBAR */}
      <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-8 h-16 flex items-center justify-between transition-all duration-300 shadow-xl">
        <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-[0_1px_14px_rgba(255,255,255,0.08)]">
          🚀 Admin Dashboard
        </h2>
        <button
          onClick={() => {
            localStorage.removeItem('adminToken')
            navigate('/admin')
          }}
          className="px-5 py-2 rounded-2xl text-sm font-semibold text-red-400 border border-red-500/40 transition-all duration-300 hover:shadow-[0_0_16px_3px_rgba(239,68,68,0.16)] hover:bg-red-950/40 focus:outline-none"
        >
          Logout
        </button>
      </nav>

      {/* CONTENT */}
      <div className="w-full px-6 py-6 animate-fade-in">
        {/* ANALYTICS CARDS */}
        <AnalyticsCards />

        {/* HEADER */}
        <div className="mb-6">
          <h3 className="text-3xl font-black text-white leading-tight mb-1">
            Total Issues: <span className="text-blue-400 drop-shadow-[0_0_7px_rgba(56,189,248,0.26)]">{issues.length}</span>
          </h3>
          <p className="text-base text-gray-400 tracking-wide">
            Manage and track all reported issues
          </p>
        </div>

        {/* FLEX LAYOUT START */}
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-180px)]">

          {/* LEFT SIDE - ISSUE LIST */}
          <div className="w-full lg:w-[35%] h-full overflow-y-auto pr-2">
            {/* SELECTED ISSUE - STATUS UPDATE SECTION */}
            {selected && (
              <div className="mb-6 transition-all duration-300 animate-fade-in">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 transition-all duration-300">
                  <div className="flex-1">
                    <div className="font-mono text-sm font-bold text-blue-300 mb-1">{selected.ticket_id}</div>
                    <div className="text-white mb-3">{selected.description}</div>
                    {/* 🔥 EXTRA DETAILS */}
                    <div className="mt-2 flex flex-col gap-1">

                      <div className="text-sm text-red-400">
                        🔥 Severity: {selected.severity}/10
                      </div>

                      <div className="text-sm text-yellow-400">
                        ⏱ {getRemainingTime(selected.deadline)}
                      </div>

                      <div className="text-sm text-blue-300">
                        🤖 AI Confidence: {selected.confidence ? (selected.confidence * 100).toFixed(0) : 0}%
                      </div>

                      {selected.is_duplicate && (
                        <div className="text-sm text-orange-400">
                          ⚠️ Duplicate issue nearby
                        </div>
                      )}

                    </div>
                    <div className="text-xs flex items-center gap-3 text-gray-400">
                      <span>{CAT_ICONS[selected.category]} {selected.category}</span>
                      <span>{timeAgo(selected.created_at)}</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full font-semibold transition-all duration-300 shadow ${statusBadgeClass(selected.status)}`}
                      >
                        {selected.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-64 max-w-full">
                    <label htmlFor="status-select" className="block text-xs font-bold text-gray-200 mb-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAfterImage(e.target.files[0])}
                        className="text-xs text-gray-300 mt-2"
                      />
                      Update Status
                    </label>
                    <select
                      id="status-select"
                      value={newStatus}
                      disabled={updating}
                      onChange={e => setNewStatus(e.target.value)}
                      className="border border-white/10 bg-white/5 text-white px-3 py-2 rounded-lg outline-none text-sm transition-all duration-300 focus:ring-2 focus:ring-white/20 disabled:opacity-60 appearance-none"
                      style={{ backgroundColor: "#020617", color: "white" }}
                    >
                      <option value="" className="bg-black text-white">
                        -- Select --
                      </option>
                      {statusOptions.map(opt => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="bg-black text-white"
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={updateStatus}
                        disabled={updating || !newStatus || newStatus === selected.status}
                        className={`px-4 py-2 rounded-2xl text-white text-sm font-semibold bg-gradient-to-br from-gray-800 to-gray-700 shadow-lg transition-all duration-300 hover:from-blue-800 hover:to-blue-700 hover:shadow-blue-400/30 focus:outline-none ${
                          updating || !newStatus || newStatus === selected.status
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105'
                        }`}
                      >
                        {updating ? "Updating..." : "Update"}
                      </button>
                      <button
                        onClick={() => { setSelected(null); setNewStatus(''); }}
                        disabled={updating}
                        className="px-4 py-2 rounded-2xl border border-white/10 text-gray-300 text-sm font-semibold bg-gray-800/20 hover:bg-gray-700/40 transition-all duration-300 focus:outline-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ISSUE LIST */}
            {issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-gray-500 animate-fade-in transition-all duration-300">
                <div className="text-6xl mb-5 animate-fade-in">📭</div>
                <p className="text-lg font-medium tracking-wide fade-in">No issues found</p>
              </div>
            ) : (
              <div className="grid gap-5">
                {[...issues].sort((a, b) => (b.severity || 0) - (a.severity || 0)).map(issue => (
                  <div
                    key={issue.id}
                    className={`
                      bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl rounded-2xl p-5 transition-all duration-300
                      hover:scale-[1.02] hover:shadow-lg cursor-pointer group
                      ${selected && selected.id === issue.id
                        ? 'border-2 border-blue-400 shadow-blue-500/20'
                        : ''}
                    `}
                    onClick={() => {
                      setSelected(issue)
                      setNewStatus(issue.status)
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono text-sm font-bold text-blue-200">{issue.ticket_id}</span>
                      <span
                        className={`
                          text-xs px-3 py-1 rounded-full font-semibold shadow transition-all duration-300
                          ${statusBadgeClass(issue.status)}
                        `}
                      >
                        {issue.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200 mb-3">{issue.description}</p>
                    <div className="flex gap-4 mt-2">
                      {issue.photo_url && (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-400 mb-1">Before</span>
                          <img
                            src={issue.photo_url}
                            className="w-32 h-20 rounded object-cover transition-all duration-300 hover:scale-105"
                          />
                        </div>
                      )}

                      {issue.after_image_url && (
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-green-400 mb-1">After</span>
                          <img
                            src={issue.after_image_url}
                            className="w-32 h-20 rounded object-cover border border-green-400"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 mb-2">

                      {/* Severity */}
                      <div className={`text-xs font-bold ${
                        issue.severity >= 8 ? "text-red-500" :
                        issue.severity >= 6 ? "text-orange-400" :
                        "text-yellow-300"
                      }`}>
                        🔥 Severity: {issue.severity || 5}/10
                      </div>

                      {/* Deadline */}
                      <div className="text-xs text-yellow-400">
                        ⏱ {getRemainingTime(issue.deadline)}
                      </div>

                      {/* AI Confidence */}
                      <div className="text-xs text-blue-300">
                        🤖 AI: {issue.confidence ? (issue.confidence * 100).toFixed(0) : 0}%
                      </div>

                      {/* Duplicate */}
                      {issue.is_duplicate && (
                        <div className="text-xs text-orange-400 font-bold">
                          ⚠️ Possible Duplicate
                        </div>
                      )}

                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>
                        {CAT_ICONS[issue.category]} {issue.category}
                      </span>
                      <span>{timeAgo(issue.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE - MAP SECTION */}
          <div className="w-full lg:w-[65%] h-full">
            <div className="mb-6 h-full flex flex-col">
              <h4 className="font-bold text-white mb-3 tracking-wide text-lg">
                Issue Locations
              </h4>
              <div className="h-full min-h-[500px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:scale-[1.01] hover:shadow-blue-900/40 hover:ring-1 hover:ring-blue-500/30 transition-all duration-300 flex-1">
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {issues.filter(issue => issue.latitude && issue.longitude).map(issue => (
                    <CircleMarker
                      key={issue.id}
                      center={[Number(issue.latitude), Number(issue.longitude)]}
                      pathOptions={{
                        color: STATUS_COLOR[issue.status],
                        fillColor: STATUS_COLOR[issue.status],
                        fillOpacity: (issue.severity ?? 5) / 10,
                      }}
                      radius={(issue.severity ?? 5) * 2}
                      eventHandlers={{
                        click: () => {
                          setSelected(issue)
                          setNewStatus(issue.status)
                        },
                      }}
                    >
                      <Popup>
                        <div className="space-y-1">
                          <div className="font-semibold text-black">{issue.ticket_id}</div>
                          <div className="text-sm text-black-200">{issue.description}</div>

                          <div className="text-xs text-gray-400">
                            {CAT_ICONS[issue.category]} {issue.category}
                          </div>

                          <div className="text-xs text-red-400 font-bold">
                            🔥 Severity: {issue.severity}/10
                          </div>

                          <div className="text-xs text-blue-300">
                            🤖 {issue.confidence ? (issue.confidence * 100).toFixed(0) : 0}%
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

        </div>
        {/* FLEX LAYOUT END */}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`
          fixed bottom-8 right-8 px-6 py-4 rounded-3xl
          border border-white/10 shadow-xl font-semibold text-white z-[100]
          backdrop-blur-lg bg-white/10 select-none
          animate-fade-in transition-all duration-300
        `}>
          <span className="text-lg mr-1">{toast.type === "success" ? "✅" : "❌"}</span>
          <span>{toast.msg}</span>
        </div>
      )}
      <style>
        {`
          .animate-fade-in {
            animation: fade-in 0.7s cubic-bezier(0.42,0,0.58,1) both;
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(24px) scale(0.98);}
            to   { opacity: 1; transform: translateY(0) scale(1);}
          }
        `}
      </style>
    </div>
  )
}
