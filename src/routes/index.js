const router = require("express").Router();

const authRoutes = require("./api/authRoutes");
const noteRoutes = require("./api/noteRoutes");
const tokenValidation = require("../middlewares/tokenValidation");

router.use("/api", authRoutes);
router.use("/api", tokenValidation, noteRoutes);

router.get("/api", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

router.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;
