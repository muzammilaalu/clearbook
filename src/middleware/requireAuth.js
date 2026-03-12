// src/middleware/requireAuth.js
// Protects API routes — rejects requests that have no valid session token.

export function requireAuth(req, res, next) {
  if (!req.session?.accessToken) {
    return res.status(401).json({
      success: false,
      error:   'unauthenticated',
      message: 'No active session. Please authenticate via GET /auth/login first.',
    });
  }
  next();
}