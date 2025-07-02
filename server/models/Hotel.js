const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: String,
  text: String,
  date: { type: Date, default: Date.now }
});

const hotelSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  city: String,
  country: String,
  latitude: Number,
  longitude: Number,
  comments: [commentSchema],  // ✅ Yorumlar burada tutuluyor
  discount: { type: Number, default: null }, // Yüzde cinsinden indirim
  amenities: { 
    type: [{
      name: String,
      score: Number
    }], 
    default: [] 
  } // Otel özellikleri ve puanları
});

module.exports = mongoose.model('Hotel', hotelSchema);
