const router = require("express").Router();

const noteController = require("../../controllers/api/noteController");

router.get("/get-all-notes", noteController.getAllNotes);

router.post("/create-note", noteController.createNote);

module.exports = router;
