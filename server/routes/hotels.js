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
    const { city, date, guests, country } = req.query;

    const query = {
      city: new RegExp(city, 'i'),
      country: new RegExp(country, 'i')
    };

    const hotels = await Hotel.find(query).sort({ rating: -1 });
    res.json(hotels);
  } catch (err) {
    console.error('Arama hatası:', err);
    res.status(500).json({ error: 'Arama sırasında hata oluştu' });
  }
});

// 3. Tek oteli getir
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Otel bulunamadı' });
    res.json(hotel);
  } catch (err) {
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
    hotel.commentCount = hotel.comments.length;

    await hotel.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error("Yorum eklenemedi:", err);
    res.status(500).json({ error: 'Yorum eklenemedi' });
  }
});

module.exports = router;
