const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  country: String,
  city: String,
  photo: String // 🔥 opsiyonel
});

module.exports = mongoose.model('User', UserSchema);
