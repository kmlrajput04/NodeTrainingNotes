const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: false,
  },
  tokens: {
    type: String,
  },
  avatar: {
    type: String,
    default: "",
    required: false,
  },
  is_deleted: {
    type: Boolean,
    default: false,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const User = mongoose.model("User", userSchema);
module.exports = User;
