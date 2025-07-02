const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  
  if (!token) {
    return res.status(403).json({ error: 'Token gerekli' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtar', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }
    req.userId = decoded.userId;
    req.username = decoded.name;
    next();
  });
};

module.exports = verifyToken;
