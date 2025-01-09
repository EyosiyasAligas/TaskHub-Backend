const router = require("express").Router();

const noteController = require("../../controllers/api/noteController");
const {
  noteDataValidation,
  handleValidationErrors,
} = require("../../middlewares/noteDataValidation");

router.get("/", noteController.getAllNotes);

router.get("/:noteId", noteController.getNoteById);

router.post(
  "/",
  noteDataValidation,
  handleValidationErrors,
  noteController.createNote,
);

router.patch(
  "/:noteId",
  noteDataValidation,
  handleValidationErrors,
  noteController.editNote,
);

router.delete("/:noteId", noteController.deleteNote);

module.exports = router;
