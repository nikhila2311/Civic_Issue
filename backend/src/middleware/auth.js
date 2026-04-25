const jwt = require('jsonwebtoken')

const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.admin = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

const verifyUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ success: false, error: 'No token provided' })
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ success: false, error: 'Invalid token' })
  }
}

module.exports = { verifyAdmin, verifyUser }