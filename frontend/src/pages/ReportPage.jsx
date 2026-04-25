import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL

const CATEGORIES = [
  { id: 'pothole',     label: 'Pothole',      icon: '🕳️', color: 'border-gray-400 bg-white/10 text-white' },
  { id: 'streetlight', label: 'Streetlight',  icon: '💡', color: 'border-amber-300 bg-white/10 text-white' },
  { id: 'garbage',     label: 'Garbage',       icon: '🗑️', color: 'border-emerald-300 bg-white/10 text-white' },
  { id: 'water',       label: 'Water Leakage', icon: '💧', color: 'border-blue-400 bg-white/10 text-white' },
]

export default function ReportPage() {
  const navigate = useNavigate()
  const { user, getToken } = useAuth()

  const [photo, setPhoto]               = useState(null)
  const [preview, setPreview]           = useState(null)
  const [description, setDescription]   = useState('')
  const [category, setCategory]         = useState('')
  const [lat, setLat]                   = useState(null)
  const [lng, setLng]                   = useState(null)
  const [locStatus, setLocStatus]       = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [ticketId, setTicketId]         = useState(null)
  const [aiSuggestion, setAiSuggestion] = useState(null)
  const [dragOver, setDragOver]         = useState(false)

  // ── Local toast ──────────────────────────────────────────
  const [toastMsg, setToastMsg]   = useState(null)
  const [toastType, setToastType] = useState('error')

  const showToast = (msg, type = 'error') => {
    setToastMsg(msg)
    setToastType(type)
    setTimeout(() => setToastMsg(null), 3500)
  }
  // ─────────────────────────────────────────────────────────

  const handlePhoto = (file) => {
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const detectLocation = () => {
    setLocStatus('detecting')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setLocStatus('success')
      },
      () => setLocStatus('error')
    )
  }

  const handleSubmit = async () => {
    if (!photo)              return showToast('Please upload a photo of the issue')
    if (!lat)                return showToast('Please detect your location first')
    if (!description.trim()) return showToast('Please add a brief description')

    setSubmitting(true)

    const fd = new FormData()
    fd.append('photo',       photo)
    fd.append('description', description)
    fd.append('latitude',    lat)
    fd.append('longitude',   lng)
    if (category)    fd.append('category',   category)
    if (user?.email) fd.append('email', user.email)
  
    try {
      const headers = {}
      const token = getToken()
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await axios.post(`${API}/api/issues`, fd, { headers })
      setTicketId(res.data.ticket_id)

      if (res.data.issue?.ai_category) {
        setAiSuggestion({
          category:   res.data.issue.ai_category,
          confidence: Math.round((res.data.issue.ai_confidence || 0) * 100)
        })
      }

      showToast('Issue reported successfully! 🎉', 'success')
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Submission failed. Please try again.'
      showToast(errMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setPhoto(null)
    setPreview(null)
    setDescription('')
    setCategory('')
    setLat(null)
    setLng(null)
    setLocStatus('')
    setTicketId(null)
    setAiSuggestion(null)
    setToastMsg(null)
  }

  // ── Toast UI ─────────────────────────────────────────────
  const ToastUI = () => toastMsg ? (
    <div className={`fixed top-6 right-6 z-[9999] px-5 py-3 rounded-2xl
      text-white text-base font-semibold shadow-xl animate-fade-in
      flex items-center gap-3 min-w-[280px] backdrop-blur-xl
      ${toastType === 'success' ? 'bg-gradient-to-r from-emerald-600/80 to-blue-900/80' :
        toastType === 'info'    ? 'bg-gradient-to-r from-blue-700 to-violet-700/90' :
        'bg-gradient-to-r from-rose-600/90 to-red-900/80'}`}>
      <span className="text-xl">
        {toastType === 'success' ? '✅' :
         toastType === 'info'    ? 'ℹ️' : '❌'}
      </span>
      <span>{toastMsg}</span>
    </div>
  ) : null
  // ─────────────────────────────────────────────────────────

  // ── SUCCESS SCREEN ───────────────────────────────────────
  if (ticketId) return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-[#0a0a0a] via-[#151821] to-black flex items-center justify-center p-4 transition-colors">
      <ToastUI />
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 max-w-md w-full text-center animate-slide-up transition-all duration-300 relative shadow-xl">
        <div className="absolute -top-14 left-0 right-0 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-700/70 to-blue-900/60 shadow-lg rounded-full flex items-center justify-center text-5xl border-8 border-[#181b20] select-none animate-fade-in">
            ✅
          </div>
        </div>
        <div className="pt-16">
          <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Issue Reported!</h2>
          <p className="text-gray-400 text-base mb-8 font-medium">Your complaint is now live and being tracked</p>
          <div className="bg-gradient-to-br from-white/5 to-white/10 border border-dashed border-white/10 rounded-2xl p-7 mb-7 shadow transition-all duration-300">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">Your Ticket ID</p>
            <p className="text-2xl font-mono font-extrabold text-blue-100 tracking-wider drop-shadow">{ticketId}</p>
            <p className="text-xs text-gray-500 mt-2">Save this to track your complaint anytime</p>
          </div>
          {aiSuggestion && (
            <div className="flex items-center gap-3 p-4 bg-white/10 border border-white/10 rounded-xl mb-7 text-left shadow-sm animate-fade-in transition-all duration-300">
              <span className="text-2xl text-gray-200">🤖</span>
              <div>
                <p className="text-xs font-bold text-white/80 leading-tight mb-1">AI Classification</p>
                <p className="text-sm text-blue-200 font-medium tracking-wide">
                  {aiSuggestion.category} &middot; {aiSuggestion.confidence}% confident
                </p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <button
              className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold py-3 shadow transition-all duration-300 text-base hover:bg-white/15 hover:shadow-lg hover:scale-[1.02]"
              onClick={() =>
                navigator.clipboard.writeText(ticketId)
                  .then(() => showToast('Ticket ID copied!', 'success'))
                  .catch(() => showToast('Could not copy', 'error'))
              }
            >📋 Copy Ticket ID</button>
            <button
              className="rounded-2xl bg-gradient-to-r from-gray-900 to-blue-900 border border-white/10 text-white font-bold py-3 shadow transition-all duration-300 text-base hover:bg-gradient-to-r hover:from-blue-900 hover:to-violet-900 hover:shadow-lg hover:scale-[1.02]"
              onClick={() => navigate(`/track/${ticketId}`)}
            >🔍 Track This Issue</button>
            {user && (
              <button
                className="rounded-2xl border border-white/15 bg-white/5 text-blue-200 font-semibold py-3 hover:bg-white/10 focus:bg-white/10 transition-all duration-300 shadow hover:shadow-lg hover:scale-[1.02]"
                onClick={() => navigate('/dashboard')}
              >📊 Go to My Dashboard</button>
            )}
            <button
              className="rounded-2xl text-gray-400 font-medium py-2 hover:text-blue-300 transition-all duration-300"
              onClick={reset}
            >Report Another Issue</button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── MAIN FORM ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-[#0a0a0a] via-[#191c23] to-black flex flex-col">
      <ToastUI />
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-black/85 backdrop-blur-xl border-b border-white/10 shadow-none transition-all duration-300">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(user ? '/dashboard' : '/')}
            className="rounded-xl px-4 py-1.5 text-lg font-medium bg-white/5 text-white hover:bg-white/10 hover:text-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
          >← Back</button>
          <span className="font-black text-2xl bg-gradient-to-r from-white via-blue-300 to-violet-500 bg-clip-text text-transparent select-none tracking-tight drop-shadow">CivicPulse</span>
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-800 to-violet-800 flex items-center justify-center text-white text-xl font-extrabold shadow-lg">{user.name?.[0]?.toUpperCase() || 'U'}</div>
            </div>
          ) : (
            <button onClick={() => navigate('/auth')}
              className="rounded-xl px-4 py-1.5 text-lg font-medium bg-white/5 text-white hover:bg-white/10 hover:text-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
            >Sign In</button>
          )}
        </div>
      </nav>
      <div className="flex flex-1 justify-center items-center px-1 py-10 min-h-[90vh]">
        <div className="w-full max-w-2xl flex flex-col gap-7 transition-all duration-300">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-0 sm:px-12 py-8 shadow-xl transition-all duration-300 text-center">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2 leading-[1.15] drop-shadow">Report a Civic Issue</h1>
            <p className="text-base text-gray-400 font-medium">Fill in the details below &middot; Takes under 30 seconds</p>
          </div>
          <div className="flex flex-col gap-7">
            {/* PHOTO UPLOAD */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-7 shadow-xl transition-all duration-300 animate-slide-up">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block text-xl text-blue-200">📸</span>
                <span className="font-semibold text-white text-lg leading-tight">
                  Photo Upload <span className="text-pink-400">*</span>
                </span>
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  handlePhoto(e.dataTransfer.files[0])
                }}
                onClick={() => document.getElementById('photoInput').click()}
                className={`
                  relative flex flex-col justify-center items-center border-2 border-dashed rounded-2xl p-9 w-full text-center cursor-pointer
                  bg-white/5 transition-all duration-300
                  ${dragOver
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-white/10 hover:border-blue-600 hover:bg-white/10 hover:shadow-lg hover:scale-[1.02]'
                  }`}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="w-full max-h-64 object-cover rounded-2xl shadow-lg transition-all" />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-900/40 to-violet-900/20 flex items-center justify-center text-3xl mb-4 border border-white/10 shadow">
                      📷
                    </div>
                    <div className="font-semibold text-white text-base mb-1">Click or drag photo here</div>
                    <div className="text-gray-500 text-xs">JPG, PNG, WEBP</div>
                  </div>
                )}
                <input
                  id="photoInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handlePhoto(e.target.files[0])} 
                />
                <div className="absolute right-3 top-3 pointer-events-none drop-shadow">{photo && <span className="bg-black/30 rounded-full px-2 py-1 text-xs text-blue-300 font-semibold border border-blue-600/40 shadow">Chosen</span>}</div>
              </div>
              {preview && (
                <button
                  className="rounded-xl mt-4 px-3 py-1.5 bg-white/10 text-red-400 border border-red-800 font-medium text-xs hover:bg-red-900/40 hover:text-red-300 hover:shadow-lg transition-all duration-300"
                  onClick={e => {
                    e.stopPropagation()
                    setPhoto(null)
                    setPreview(null)
                  }}>
                  🗑 Remove photo
                </button>
              )}
            </div>

            {/* LOCATION SECTION */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-7 shadow-xl transition-all duration-300 animate-slide-up">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block text-lg text-blue-200">📍</span>
                <span className="font-semibold text-white text-lg leading-tight">
                  Your Location <span className="text-pink-400">*</span>
                </span>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                className={`w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 shadow
                  border-2 transition-all duration-300 bg-gradient-to-r group outline-none
                ${
                  locStatus === 'success'
                    ? 'border-emerald-500 bg-emerald-900/30 text-emerald-300 hover:shadow-lg hover:scale-[1.02]'
                    : locStatus === 'error'
                      ? 'border-red-800 bg-red-900/30 text-red-300 hover:shadow-lg hover:scale-[1.02]'
                      : 'border-white/10 bg-white/5 text-white hover:border-blue-600 hover:bg-white/10 hover:shadow-lg hover:scale-[1.02]'
                }`}
              >
                {locStatus === 'detecting' && (
                  <span className="spinner border-blue-300 border-t-blue-600 animate-spin" />
                )}
                {locStatus === 'success'   ? '✅ Location detected successfully' :
                 locStatus === 'error'     ? '❌ Could not detect — enable GPS' :
                 locStatus === 'detecting' ? 'Detecting location...' :
                 <span className="flex items-center gap-2 font-medium">
                   <span>🗺️</span> Detect My Location Automatically
                 </span>}
              </button>
              {lat && (
                <p className="text-xs text-blue-300 mt-2 font-mono bg-blue-900/20 rounded-lg px-3 py-1 inline-block shadow-inner">
                  <span className="font-bold">Latitude:</span> {lat.toFixed(6)}
                  <span className="mx-2">|</span>
                  <span className="font-bold">Longitude:</span> {lng.toFixed(6)}
                </p>
              )}
            </div>

            {/* CATEGORY SECTION */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-7 shadow-xl transition-all duration-300 animate-fade-in">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block text-lg text-violet-200">🏷️</span>
                <span className="font-semibold text-white text-lg flex-1 leading-tight">
                  Issue Category
                  <span className="ml-2 text-xs font-normal text-gray-500">(optional — AI will detect from photo)</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(category === cat.id ? '' : cat.id)}
                    className={`py-3 px-4 rounded-2xl border-2 font-semibold text-base flex items-center gap-3 transition-all duration-300 focus:outline-none
                      ${
                        category === cat.id
                          ? cat.color + ' shadow-lg scale-[1.02] border-blue-700 ring-2 ring-blue-900'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:border-blue-700 hover:bg-white/10 hover:shadow-lg hover:scale-[1.02]'
                      }`}
                  >
                    <span className="text-xl drop-shadow">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* DESCRIPTION SECTION */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-7 shadow-xl transition-all duration-300 animate-slide-up">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-block text-lg text-violet-200">📝</span>
                <span className="font-semibold text-white text-lg leading-tight">
                  Description <span className="text-pink-400">*</span>
                </span>
              </div>
              <div className="relative">
                <textarea
                  className="peer h-32 bg-white/5 rounded-2xl border-2 border-white/10 w-full resize-none pt-6 pb-2 px-4 font-medium text-base text-white focus:border-blue-700 focus:ring-2 focus:ring-blue-900 focus:bg-black/30 outline-none transition-all duration-300 placeholder-transparent shadow hover:shadow-lg"
                  placeholder=" " // Floating label
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  maxLength={300}
                  id="description-textarea"
                />
                <label
                  htmlFor="description-textarea"
                  className="absolute left-4 top-4 pointer-events-none text-base font-medium text-gray-500 transition-all duration-300 
                    peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
                    peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-300 bg-white/5 px-1 rounded"
                >
                  Briefly describe the issue&hellip;
                </label>
                <span className={`absolute bottom-2 right-4 text-xs font-medium transition-colors duration-300 ${
                  description.length > 280 ? 'text-red-400' : 'text-gray-500'
                }`}>
                  {description.length}/300
                </span>
              </div>
            </div>

            {/* CHECKLIST/PROGRESS */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-7 shadow-xl animate-fade-in transition-all duration-300">
              <p className="text-sm font-extrabold text-blue-200 mb-4 uppercase tracking-wide flex items-center gap-2">
                <span className="text-blue-400 text-base">🗒️</span>
                Before submitting, confirm:
              </p>
              <div className="flex flex-col gap-2">
                {[
                  { check: !!photo,              label: 'Photo uploaded' },
                  { check: locStatus === 'success', label: 'Location detected' },
                  { check: description.length > 5,  label: 'Description added' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black
                      transition-all duration-300 shadow
                      ${
                        item.check
                          ? 'bg-gradient-to-br from-emerald-600 to-blue-900 text-white shadow-lg'
                          : 'bg-gray-800 text-gray-600 shadow-inner'
                      }`}>
                      {item.check ? '✓' : '○'}
                    </div>
                    <span className={`text-sm font-medium
                      transition-all duration-300
                      ${item.check ? 'text-emerald-300' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-7 shadow-xl transition-all duration-300 animate-slide-up flex flex-col gap-3 mt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-4 text-lg font-extrabold rounded-2xl 
                  bg-gradient-to-r from-gray-900 via-blue-900 to-violet-900
                  shadow-xl hover:shadow-lg hover:scale-[1.02] 
                  text-white transition-all duration-300 flex items-center justify-center
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ring-0 focus:ring-2 focus:ring-blue-900"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner border-blue-300 border-t-violet-600 animate-spin" />
                    <span className="font-medium">Submitting &amp; Analyzing with AI...</span>
                  </span>
                ) : (
                  <span>🚀 Submit Report</span>
                )}
              </button>
              <div className="text-center text-xs text-gray-500 py-2 mt-1 select-none">No account needed · Your data is private · AI-powered classification</div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}