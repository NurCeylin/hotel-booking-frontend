const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const hotelRoutes = require('./routes/hotels');
const authRoutes = require('./routes/auth');

dotenv.config();

const app = express();

// Ortak middleware
app.use(cors());
app.use(express.json());

// 📁 Yüklenen fotoğraflar herkese açık olmalı
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API rotaları
app.use('/api/hotels', hotelRoutes);
app.use('/api/auth', authRoutes);

// MongoDB bağlantısı
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ MongoDB\'ye başarıyla bağlandı');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB bağlantı hatası:', err);
  });
