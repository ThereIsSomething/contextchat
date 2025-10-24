import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email, username: decoded.username };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      const e = new Error('Authentication error: missing token');
      e.data = { reason: 'missing_token' };
      return next(e);
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.id, email: decoded.email, username: decoded.username };
    next();
  } catch (err) {
    const e = new Error('Authentication error: invalid token');
    e.data = { reason: 'invalid_token' };
    next(e);
  }
};
