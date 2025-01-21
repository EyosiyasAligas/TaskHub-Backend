require("dotenv").config();

const config = {
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
};

module.exports = config;
