require('dotenv').config()

const express  = require('express')
const cors     = require('cors')
const supabase = require('./src/config/supabase')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: "*",
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Routes ────────────────────────────────────────────────
const authRouter   = require('./src/routes/auth')
const issuesRouter = require('./src/routes/issues')
const adminRouter  = require('./src/routes/adminRoutes')

app.use('/api/auth',   authRouter)
app.use('/api/issues', issuesRouter)
app.use('/api/admin',  adminRouter)

// ── Health ────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ success: false, error: err.message })
})

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`)

  const { error } = await supabase.from('issues').select('id').limit(1)
  if (error) console.log('❌ Supabase error:', error.message)
  else console.log('✅ Supabase connected')
})