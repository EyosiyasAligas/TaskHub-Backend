const router = require("express").Router();

const authRoutes = require("./api/authRoutes");
const noteRoutes = require("./api/noteRoutes");
const tagRouter = require("./api/tagRoutes");
const tokenValidation = require("../middlewares/tokenValidation");

router.get("/api", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

router.use("/api", authRoutes);
router.use("/api/note", tokenValidation, noteRoutes);
router.use("/api/tags", tokenValidation, tagRouter);

router.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

router.use((req, res) => {
  console.log("route: ", req.originalUrl);
  res.status(404).json({ message: "Route not found" });
});

module.exports = router;
