import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import axios from 'axios'
import 'leaflet/dist/leaflet.css'

const API = import.meta.env.VITE_API_URL

// 🎯 Status Colors
const STATUS_COLOR = {
  pending: '#f59e0b',        // amber
  in_progress: '#3b82f6',    // blue
  resolved: '#10b981'        // green
}

// 🎯 Category Icons
const CAT_ICONS = {
  pothole: '🕳️',
  garbage: '🗑️',
  water: '💧',
  streetlight: '💡',
  other: '📋'
}

export default function PublicMap() {
  const [issues, setIssues] = useState([])

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const res = await axios.get(`${API}/api/issues`)
      setIssues(res.data.issues || [])
    } catch (err) {
      console.error("Public map error:", err)
    }
  }

  // 🎯 Default center (fallback)
  let center = [17.7, 83.3]

  if (issues.length > 0) {
    const first = issues.find(i => i.latitude && i.longitude)
    if (first) {
      center = [Number(first.latitude), Number(first.longitude)]
    }
  }

  return (
    <div className="h-screen w-full bg-black">

      {/* 🔥 Header */}
      <div className="absolute z-[1000] top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-lg">
        <h1 className="text-white font-bold text-lg tracking-wide">
          🌍 Live City Issue Map
        </h1>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 🔥 Issue Markers */}
        {issues
          .filter(i => i.latitude && i.longitude)
          .map(issue => {

            const color = STATUS_COLOR[issue.status] || '#f59e0b'
            const severity = issue.severity || 5

            return (
              <CircleMarker
                key={issue.id}
                center={[Number(issue.latitude), Number(issue.longitude)]}
                radius={severity * 2} // 🔥 severity-based size
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.7
                }}
              >
                {/* 🔥 Popup (Transparency + Awareness) */}
                <Popup>
                  <div className="space-y-2 text-black">

                    <div className="font-bold text-sm">
                      {issue.ticket_id}
                    </div>

                    <div className="text-sm">
                      {issue.description}
                    </div>

                    <div className="text-xs">
                      {CAT_ICONS[issue.category]} {issue.category}
                    </div>

                    <div className="text-xs font-semibold">
                      Status: {issue.status.replace('_', ' ')}
                    </div>

                    <div className="text-xs">
                      🔥 Severity: {severity}/10
                    </div>

                    {issue.confidence && (
                      <div className="text-xs">
                        🤖 AI: {(issue.confidence * 100).toFixed(0)}%
                      </div>
                    )}

                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
      </MapContainer>
    </div>
  )
}