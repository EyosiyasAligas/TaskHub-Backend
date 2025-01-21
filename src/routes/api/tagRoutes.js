const router = require("express").Router();

const tagController = require("../../controllers/api/tagController");
const {
  tagDataValidation,
  handleValidationErrors,
} = require("../../middlewares/tagDataValidation");

router.get("/", tagController.getAllTags);
router.get("/:tagId", tagController.getTagById);
router.post(
  "/",
  tagDataValidation,
  handleValidationErrors,
  tagController.createTag,
);
router.put(
  "/:tagId",
  tagDataValidation,
  handleValidationErrors,
  tagController.updateTag,
);
router.delete("/:tagId", tagController.deleteTag);

module.exports = router;
