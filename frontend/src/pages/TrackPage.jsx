import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL
const STATUS_STEPS = ['pending', 'in_progress', 'resolved']
const STATUS_LABELS = {
  pending: 'Reported',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}
const STEP_ICONS = {
  pending: '📝',
  in_progress: '🔧',
  resolved: '✅',
}
const STATUS_COLORS = {
  pending: 'bg-amber-500/20 text-amber-300',
  in_progress: 'bg-blue-500/20 text-blue-300',
  resolved: 'bg-emerald-500/20 text-emerald-300',
}
const CAT_ICONS = {
  pothole: '🕳️',
  streetlight: '💡',
  garbage: '🗑️',
  water: '💧',
  other: '📋',
}

function formatDate(d) {
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TrackPage() {
  const navigate = useNavigate()
  const { ticketId: paramId } = useParams()
  const [input, setInput] = useState(paramId || '')
  const [issue, setIssue] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (paramId) fetchIssue(paramId)
    // eslint-disable-next-line
  }, [paramId])

  const fetchIssue = async (id) => {
    setLoading(true)
    setError(null)
    setIssue(null)
    try {
      const res = await axios.get(`${API}/api/issues/track/${id}`)
      setIssue(res.data.issue)
      setHistory(res.data.history || [])
    } catch {
      setError('Issue not found. Please check your Ticket ID.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = issue ? STATUS_STEPS.indexOf(issue.status) : -1

  // Stepper UI for timeline
  const Stepper = () => (
    <div className="flex items-center w-full justify-between px-2 sm:px-4 relative">
      {STATUS_STEPS.map((step, idx) => {
        const reached = idx <= currentStep
        const isCurrent = idx === currentStep
        const isLast = idx === STATUS_STEPS.length - 1
        return (
          <React.Fragment key={step}>
            <div className="relative flex flex-col items-center flex-1 z-10">
              <div
                className={`
                  flex items-center justify-center
                  w-12 h-12 sm:w-14 sm:h-14 rounded-full border-4
                  transition-all duration-300
                  ${reached
                    ? isCurrent
                      ? 'border-gradient-to-br from-blue-500 to-violet-500 animate-pulse'
                      : 'border-blue-400'
                    : 'border-white/10'}
                  bg-white/5 shadow-lg
                  ${isCurrent
                    ? 'scale-110'
                    : reached
                    ? ''
                    : 'opacity-60'}
                `}
                style={{
                  borderImage: isCurrent
                    ? 'linear-gradient(to bottom right, #3b82f6, #a21caf) 1'
                    : undefined,
                }}
              >
                <span className={`text-2xl font-bold select-none transition-colors duration-300 ${
                  isCurrent
                    ? 'text-violet-400'
                    : reached
                    ? 'text-blue-300'
                    : 'text-gray-500'
                }`}>
                  {STEP_ICONS[step]}
                </span>
              </div>
              <span
                className={`
                  text-xs sm:text-sm font-semibold mt-2 text-center
                  transition-colors duration-300
                  ${isCurrent
                    ? 'text-violet-300'
                    : reached
                    ? 'text-blue-300'
                    : 'text-gray-500'}
                `}
              >
                {STATUS_LABELS[step]}
              </span>
              <span className="text-[11px] sm:text-xs text-gray-500 mt-1 font-mono min-h-[18px]">
                {(idx === 0 && issue) || (history.find((h) => h.new_status === step))
                  ? formatDate(
                      idx === 0
                        ? issue.created_at
                        : history.find((h) => h.new_status === step)?.changed_at
                    )
                  : ''}
              </span>
            </div>
            {!isLast && (
              <div className="flex-1 h-2 flex items-center -mx-2 sm:-mx-1.5">
                <div
                  className={`
                    w-full h-1 rounded-full transition-all duration-300
                    ${idx < currentStep
                      ? 'bg-gradient-to-r from-blue-400/30 to-violet-400/30'
                      : 'bg-white/10'}
                  `}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#070b14] to-black flex flex-col min-w-0">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-md transition-all duration-300">
        <div className="max-w-2xl mx-auto px-5 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="btn-ghost text-sm rounded-lg hover:bg-white/10 transition-all duration-300 border border-white/10 bg-white/5 text-gray-300"
          >
            ← Back
          </button>
          <span className="font-black text-xl bg-gradient-to-r from-blue-400 to-violet-600 bg-clip-text text-transparent tracking-tight">CivicPulse</span>
          <button
            onClick={() => navigate('/report')}
            className="bg-white/5 border border-white/10 text-white text-sm px-5 py-2 rounded-xl shadow hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md"
          >
            + Report
          </button>
        </div>
      </nav>

      <div className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto py-10 px-2 sm:px-6 flex flex-col items-center">
          <div className="w-full max-w-xl mx-auto">
            <div className="mb-10 text-center">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 transition-all duration-300">Track Your Complaint</h1>
              <p className="text-gray-400 mt-2 text-lg transition-all duration-300">Enter your Ticket ID to see real-time status updates</p>
            </div>
            {/* SEARCH */}
            <div className="flex gap-3 mb-10">
              <input
                className="flex-1 px-5 py-3 rounded-2xl bg-white/5 border-2 border-white/10 focus:ring-2 focus:ring-white/20 text-white placeholder-gray-500 focus:border-white/30 backdrop-blur-md transition-all duration-300 shadow-md font-mono text-lg tracking-wide outline-none hover:scale-[1.02] hover:shadow-lg"
                placeholder="e.g. RV-2026-K7M2P"
                value={input}
                onChange={e => setInput(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && fetchIssue(input)}
                disabled={loading}
                aria-label="Ticket ID"
                spellCheck={false}
                autoComplete="off"
              />
              <button
                className={`flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-800 to-gray-700 border border-white/10 backdrop-blur-md text-white text-lg font-semibold shadow-xl hover:from-gray-700 hover:to-gray-600 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ${loading ? "opacity-60 pointer-events-none" : ""}`}
                onClick={() => fetchIssue(input)}
                disabled={loading}
              >
                {loading ? <span className="spinner w-6 h-6 block" /> : <span className="mr-2">🔍</span>}
                Track
              </button>
            </div>

            {/* EMPTY / ERROR STATE */}
            {!issue && !error && !loading && (
              <div className="flex flex-col items-center justify-center h-64 animate-fade-in rounded-2xl bg-white/5 border border-white/10 shadow-inner transition-all duration-300 backdrop-blur-xl hover:scale-[1.02] hover:shadow-lg">
                <span className="text-5xl mb-2 text-gray-500">📋</span>
                <span className="text-gray-400 font-medium text-lg mb-1">Enter a valid Ticket ID above</span>
                <span className="text-gray-400 text-sm">You'll see your complaint status here.</span>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="flex items-center gap-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl mb-8 shadow animate-fade-in transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                <span className="text-3xl">❌</span>
                <p className="text-red-300 font-semibold text-base">{error}</p>
              </div>
            )}

            {/* RESULTS */}
            {issue && (
              <div className="w-full">
                {/* Main Card */}
                <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl mx-auto mb-10 py-8 px-5 sm:py-10 sm:px-10 animate-fade-in transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-y-6 gap-x-4 mb-7 pb-7 border-b border-white/10">
                    <div className="flex flex-col gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wider font-bold text-gray-400">Ticket ID</span>
                        <span className={`rounded-full px-3 py-0.5 ml-2 text-xs font-semibold uppercase ${STATUS_COLORS[issue.status]} shadow-sm transition-all duration-300`}>
                          {STATUS_LABELS[issue.status]}
                        </span>
                      </div>
                      <span className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-wider pl-1">{issue.ticket_id}</span>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2 text-gray-300 text-sm font-medium">
                      <div className="inline-flex items-center gap-2">
                        <span className="text-xl">{CAT_ICONS[issue.category]}</span>
                        <span className="font-semibold text-gray-200">{issue.category}</span>
                      </div>
                      <span className="text-gray-500 font-mono text-xs">
                        🕒 {formatDate(issue.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="w-full mb-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                    <Stepper />
                  </div>

                  {/* Issue Photo */}
                  {issue.photo_url && (
                    <div className="w-full mb-7">
                      <div className="overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg shadow-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                        <img
                          src={issue.photo_url}
                          alt="issue"
                          className="w-full h-56 sm:h-72 object-cover object-center rounded-2xl transition duration-200"
                        />
                      </div>
                      {issue.confidence && (
                        <div className="flex items-center gap-3 mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                          <span className="text-xl">🤖</span>
                          <div>
                            <p className="text-xs font-bold text-blue-300 uppercase mb-1">AI Classification</p>
                            <p className="text-base text-blue-300 font-mono font-semibold">{issue.category} · {(issue.confidence * 100).toFixed(1)}% confidence</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl px-5 py-5 mb-4 shadow transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xl">📝</span>
                      <span className="label text-lg font-bold text-white">Description</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-base mb-3">{issue.description}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-blue-400 text-lg mr-2">📍</span>
                      <span className="text-xs text-gray-500 font-mono">
                        {issue.latitude?.toFixed(5)}, {issue.longitude?.toFixed(5)}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Card (shown above as stepper, so extra details go here only if needed) */}
                  {/* Reserved for future details if wanted */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}