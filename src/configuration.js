// src/configuration.js
require("dotenv").config();

exports.PORT = process.env.PORT || 4001;
exports.MONGO_URI = process.env.MONGO_URI;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRE = process.env.JWT_EXPIRE;

