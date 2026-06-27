import jwt from 'jsonwebtoken'

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    req.userRole = decoded.role
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function adminMiddleware(req, res, next) {
  if (req.userRole !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' })
  next()
}
