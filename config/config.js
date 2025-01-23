require("dotenv").config();

const config = {
  jwtSecret: process.env.JWT_SECRET || "3142354",
  jwtExpiration: "24h",
};

module.exports = config;
