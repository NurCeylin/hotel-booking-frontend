const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: String,
  text: String,
  date: { type: Date, default: Date.now }
});

const hotelSchema = new mongoose.Schema({
  name: String,
  price: Number,
  rating: Number,
  commentCount: { type: Number, default: 0 },
  image: String,
  city: String,
  country: String,
  latitude: Number,
  longitude: Number,
  comments: [commentSchema]  // ✅ Yorumlar burada tutuluyor
});

module.exports = mongoose.model('Hotel', hotelSchema);
