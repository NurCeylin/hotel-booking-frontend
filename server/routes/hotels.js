const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');

// 1. Tüm otelleri getir
router.get('/', async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: 'Oteller alınamadı' });
  }
});

// 2. Otel arama (şehir + ülke)
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

// 3. Tek oteli getir
router.get('/:id', async (req, res) => {
  try {
    console.log('Aranan otel ID:', req.params.id);
    const hotel = await Hotel.findById(req.params.id);
    console.log('Bulunan otel:', hotel);
    if (!hotel) return res.status(404).json({ error: 'Otel bulunamadı' });
    res.json(hotel);
  } catch (err) {
    console.error('Otel getirme hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// 4. Yorum ekle
router.post('/:id/comments', async (req, res) => {
  const { user, text } = req.body;
  if (!user || !text) {
    return res.status(400).json({ error: 'Kullanıcı ve yorum zorunludur' });
  }

  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Otel bulunamadı' });

    const newComment = { user, text };
    hotel.comments.push(newComment);

    await hotel.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Yorum eklenemedi:", err);
    res.status(500).json({ error: 'Yorum eklenemedi' });
  }
});

module.exports = router;
