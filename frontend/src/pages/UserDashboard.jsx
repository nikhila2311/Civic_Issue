import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

const API = import.meta.env.VITE_API_URL

// Updated colors to better align with this page (deeper backgrounds, matching accents)
const STATUS_COLOR = {
  pending:     { bg: 'bg-yellow-900/40',   text: 'text-yellow-300',   border: 'border-yellow-800/60',   dot: 'bg-yellow-400',   label: '⏳ Pending' },
  in_progress: { bg: 'bg-cyan-900/40',     text: 'text-cyan-200',     border: 'border-cyan-700/70',     dot: 'bg-cyan-400',     label: '🔄 In Progress' },
  resolved:    { bg: 'bg-emerald-950/50',  text: 'text-emerald-300',  border: 'border-emerald-900/60',  dot: 'bg-emerald-400',  label: '✅ Resolved' },
}
const CAT_ICONS = { pothole: '🕳️', streetlight: '💡', garbage: '🗑️', water: '💧', other: '📋' }

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60)
    return <span className="inline-block px-3 py-0.5 rounded-2xl bg-white/10 shadow-xl backdrop-blur-lg text-xs font-bold text-emerald-300/90 drop-shadow-md transition-all duration-300">{s}<span className="font-medium text-emerald-400/50">s ago</span></span>
  if (s < 3600)
    return <span className="inline-block px-3 py-0.5 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-emerald-900/10 shadow-lg backdrop-blur-lg text-xs font-bold text-emerald-200 transition-all duration-300">{Math.floor(s / 60)}<span className="font-medium text-emerald-400/50">m ago</span></span>
  if (s < 86400)
    return <span className="inline-block px-3 py-0.5 rounded-2xl bg-gradient-to-r from-blue-400/10 to-blue-900/10 shadow-lg backdrop-blur-lg text-xs font-bold text-blue-200 transition-all duration-300">{Math.floor(s / 3600)}<span className="font-medium text-blue-300/50">h ago</span></span>
  return <span className="inline-block px-3 py-0.5 rounded-2xl bg-gradient-to-r from-slate-300/10 to-slate-900/10 shadow-lg backdrop-blur-lg text-xs font-bold text-gray-200 transition-all duration-300">{Math.floor(s / 86400)}<span className="font-medium text-gray-400/70">d ago</span></span>
}

export default function UserDashboard() {
  const navigate      = useNavigate()
  const { user, logout, getToken } = useAuth()
  const toast         = useToast()
  const [issues, setIssues]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  // set to null by default to distinguish "not loaded" from 0
  const [avgDays, setAvgDays] = useState(null);
  const location = useLocation()

  useEffect(() => {
    if (user?.email) {
      fetchMyIssues()
    }
  }, [user, location])

  const fetchMyIssues = async () => {
    try {
      const res = await axios.get(`${API}/api/issues/user`, {
        params: { email: user.email },
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setIssues(res.data.issues || [])
      const avg = calculateAvgDays(res.data.issues || []);
      setAvgDays(avg);
    } catch { toast('Failed to load your issues', 'error') }
    finally { setLoading(false) }
  }

  // fix: let avgDays be null if NO resolved issues, otherwise always return at least 1 day for >= 0 but resolved
  // so if avg is 0 (resolved same day), show "0 days" (as per your intent)
  // but if no resolved issues, avgDays remains null (not 0), so UI can indicate "N/A"
  const calculateAvgDays = (issues) => {
    const resolved = issues.filter(
      i => i.status === "resolved" && i.updated_at
    );
    if (resolved.length === 0) return null; // fix: distinguish 'no resolved issues'
    const totalDays = resolved.reduce((sum, i) => {
      const days =
        (new Date(i.updated_at) - new Date(i.created_at)) /
        (1000 * 60 * 60 * 24);
      return sum + days;
    }, 0);
    // show floor so 0 is possible, don't round up!
    const avg = totalDays / resolved.length;

    if (avg < 1) {
      return `${Math.round(avg * 24)} hrs`;
    }
    
    return `${Math.round(avg)} days`;
  };

  const handleLogout = () => {
    logout()
    navigate('/')
    toast('Logged out successfully', 'info')
  }

  const filtered = activeTab === 'all'
    ? issues
    : issues.filter(i => i.status === activeTab)

  const myStats = {
    total:       issues.length,
    pending:     issues.filter(i => i.status === 'pending').length,
    in_progress: issues.filter(i => i.status === 'in_progress').length,
    resolved:    issues.filter(i => i.status === 'resolved').length,
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Premium subtle lighting gradients */}
      <div className="pointer-events-none select-none fixed -z-10 inset-0">
        <div className="absolute left-[-80px] top-[-90px] w-[420px] h-[420px] bg-gradient-to-br from-blue-900/60 via-indigo-900/40 to-purple-900/0 blur-3xl rounded-full" />
        <div className="absolute right-[-100px] bottom-[-80px] w-[330px] h-[300px] bg-gradient-to-br from-violet-800/60 via-blue-900/70 to-transparent blur-2xl rounded-full" />
        <div className="absolute left-1/3 top-[55%] w-60 h-60 bg-gradient-to-br from-white/5 via-white/0 to-transparent blur-2xl rounded-full opacity-70" />
      </div>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-black/60 border-b border-white/10 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-900/80 via-violet-700/80 to-indigo-800/80 shadow-lg flex items-center justify-center text-white font-black text-lg transition-all duration-300 hover:shadow-lg hover:scale-105">C</div>
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-violet-400 to-pink-300 text-2xl tracking-tight drop-shadow-sm">CivicPulse</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/public')}
              className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] text-gray-300 font-medium text-sm backdrop-blur-lg border border-white/10">
              🌍 Public Map
            </button>
            <button onClick={() => navigate('/report')}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 shadow-lg text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-blue-900/40">
              + Report Issue
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-700 to-violet-700 shadow-md flex items-center justify-center text-white text-base font-black">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-base font-bold text-gray-100 leading-none">{user?.name}</p>
                <p className="text-[11px] text-gray-500">{user?.email}</p>
              </div>
              <button onClick={handleLogout}
                className="ml-2 px-3 py-1 rounded-xl text-xs text-gray-400 hover:text-red-400 hover:bg-red-800/20 transition-all duration-300">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-10">
        {/* WELCOME Card */}
        <div className="mb-3 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 px-8 py-7 shadow-lg flex flex-col gap-2 transition-all duration-300">
          <h1 className="text-4xl sm:text-5xl font-black text-gray-50 tracking-tighter mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400/80 via-violet-400/90 to-pink-400/80">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-lg text-gray-400 mt-1 font-medium">Track your reported issues and their resolution status</p>
        </div>

        {/* STATS Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: 'My Reports',  val: myStats.total,       icon: '📋', color: 'from-slate-300 to-slate-500' },
            { label: 'Pending',     val: myStats.pending,     icon: '⏳', color: 'from-yellow-400 to-yellow-700' },
            { label: 'In Progress', val: myStats.in_progress, icon: '🔄', color: 'from-cyan-300 to-cyan-600' },
            { label: 'Resolved',    val: myStats.resolved,    icon: '✅', color: 'from-emerald-400 to-emerald-700' },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-8 flex flex-col gap-3 shadow-lg transition-all duration-300 group cursor-pointer hover:shadow-lg hover:scale-[1.02]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl drop-shadow-lg">{s.icon}</span>
                <span className={`text-3xl font-black bg-gradient-to-tr ${s.color} bg-clip-text text-transparent drop-shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {s.val}
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Avg Resolution Block: Updated color to align with statistics cards and rest of UI */}
        <div className="bg-white/5 backdrop-blur-xl p-4 rounded-xl text-center border border-white/10 shadow">
          <p className="text-sm text-gray-300 font-semibold mb-2">Avg Resolution</p>
          <h2 className="text-2xl font-extrabold text-gray-50 drop-shadow mb-1">
            {/* fix: show the avgDays if available */}
            { avgDays !== null ? `${avgDays} days` : <span className="text-gray-400 text-base font-semibold">N/A</span> }
          </h2>
          <p className="text-xs text-gray-400 font-medium">Target: &lt; 7 days</p>
        </div>
              
        {/* MY ISSUES Card */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg p-8 transition-all duration-300">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-6">
            <h2 className="text-2xl font-black text-gray-100 tracking-tight">My Reported Issues</h2>
            <button onClick={() => navigate('/report')}
              className="text-base font-bold px-6 py-2 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 shadow hover:shadow-lg text-white transition-all duration-300 border border-blue-900/60 hover:scale-[1.02]">
              + New Report
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-2xl rounded-2xl mb-8 w-fit shadow-inner border border-white/10">
            {[
              { key: 'all',         label: `All (${myStats.total})` },
              { key: 'pending',     label: `Pending (${myStats.pending})` },
              { key: 'in_progress', label: `In Progress (${myStats.in_progress})` },
              { key: 'resolved',    label: `Resolved (${myStats.resolved})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 outline-none focus:ring-2 focus:ring-cyan-700
                  ${
                    activeTab === tab.key
                      ? 'bg-white/10 text-gray-100 shadow-lg scale-105'
                      : 'text-gray-400 hover:text-gray-50 hover:bg-white/10'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-8 border-white/10 border-t-blue-700 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-4">📭</div>
              <h3 className="text-2xl font-black text-gray-200 mb-3">No issues found</h3>
              <p className="text-gray-400 text-base mb-7">
                {activeTab === 'all'
                  ? "You haven't reported any issues yet"
                  : `No ${activeTab.replace('_', ' ')} issues`}
              </p>
              {activeTab === 'all' && (
                <button onClick={() => navigate('/report')} className="px-6 py-2 text-base rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 hover:scale-[1.02] hover:shadow-lg text-white font-bold shadow border border-blue-900/60 transition-all duration-300">
                  Report Your First Issue
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filtered.map(issue => {
                const sc = STATUS_COLOR[issue.status] || STATUS_COLOR.pending
                return (
                  <div
                    key={issue.id}
                    className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden hover:shadow-lg hover:scale-[1.02]"
                    onClick={() => navigate(`/track/${issue.ticket_id}`)}
                  >
                    {issue.photo_url && (
                      <div className="relative overflow-hidden h-44 group">
                        <img src={issue.photo_url} alt="issue"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                        <span className="absolute bottom-3 left-4 text-white text-base font-bold z-20 drop-shadow">
                          {CAT_ICONS[issue.category]} {issue.category}
                        </span>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-mono text-xs font-bold text-gray-400 uppercase tracking-wide">{issue.ticket_id}</span>
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border} shadow-sm transition-all duration-300`}>
                          <span className={`w-2 h-2 rounded-full ${sc.dot} mr-1`} />
                          {issue.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-base text-gray-100/90 font-semibold line-clamp-2 mb-3">{issue.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1">📍 {issue.latitude?.toFixed(3)}, {issue.longitude?.toFixed(3)}</span>
                        <span>{timeAgo(issue.created_at)}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}