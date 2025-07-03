const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Hotel = require('../models/Hotel');

// 📁 'uploads' klasörü yoksa oluştur
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// 📷 Multer ayarları
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

// Fotoğraf dosyası kontrolü
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyası yüklenebilir.'));
    }
  }
});

// ✅ Kayıt ol (fotoğraflı)
router.post('/register', upload.single('photo'), async (req, res) => {
  const { name, email, password, country, city } = req.body;

  // Şifre karmaşıklık kontrolü
  const passwordRegex = /^(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: 'Şifre en az 8 karakter, 1 rakam ve 1 özel karakter içermelidir.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Bu e-posta ile zaten bir hesap mevcut.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const photoPath = req.file ? `/uploads/${req.file.filename}` : '';

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      country,
      city,
      photo: photoPath
    });

    res.status(201).json({ message: 'Kayıt başarılı' });
    localStorage.setItem('username', newUser.name);
    localStorage.setItem('photo', newUser.photo);
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error("Kayıt sırasında hata:", err);
    res.status(400).json({ error: 'Kayıt başarısız', message: err.message });
  }
});

// ✅ Giriş yap
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Girilen e-posta ile eşleşen bir hesap bulunamadı.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Girilen şifreyle eşleşen bir hesap bulunamadı.' });

    const token = jwt.sign(
      { userId: user._id, name: user.name },
      process.env.JWT_SECRET || 'gizli_anahtar',
      { expiresIn: '1h' }
    );

    res.json({ token, name: user.name, photo: user.photo || '' });
    localStorage.setItem('username', user.name);
    localStorage.setItem('photo', user.photo || '');
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error("Giriş sırasında hata:", err);
    res.status(500).json({ error: 'Giriş başarısız', message: err.message });
  }
});

// ✅ Tüm kullanıcıları getir (opsiyonel)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.error("Kullanıcıları alma hatası:", err);
    res.status(500).json({ error: 'Kullanıcılar alınamadı', message: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { city, country, date } = req.query;

    let searchDates = [];
    if (date) {
      searchDates = [date];
    } else {
      // Yaklaşan hafta sonu
      const today = new Date();
      const day = today.getDay();
      const daysToFriday = (5 - day + 7) % 7;
      const friday = new Date(today);
      friday.setDate(today.getDate() + daysToFriday);
      const saturday = new Date(friday); saturday.setDate(friday.getDate() + 1);
      const sunday = new Date(friday); sunday.setDate(friday.getDate() + 2);
      searchDates = [friday, saturday, sunday].map(d => d.toISOString().slice(0,10));
    }

    const query = {
      country: new RegExp(country, 'i'),
      ...(city ? { city: new RegExp(city, 'i') } : {}),
      availability: { $in: searchDates }
    };

    const hotels = await Hotel.find(query).sort({ points: -1 }).limit(3);
    res.json(hotels);
  } catch (err) {
    console.error('Arama hatası:', err);
    res.status(500).json({ error: 'Arama sırasında hata oluştu' });
  }
});

module.exports = router;
