require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'e6b527b0d36eb036b0f9060c68b07a4db2f4196151cab5de902c1cc6498a44f9',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
};

module.exports = config;