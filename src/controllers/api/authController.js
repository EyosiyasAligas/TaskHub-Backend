require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = require("../../prisma/client");
const config = require("../../config/config");

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, config.bcryptSaltRounds);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with the same email already exists" });
    }

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    const token = jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: process.env.Access_Token_Expiry,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ id: user.id }, config.jwtSecret, {
      expiresIn: process.env.Access_Token_Expiry,
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
      token: token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { register, login };
