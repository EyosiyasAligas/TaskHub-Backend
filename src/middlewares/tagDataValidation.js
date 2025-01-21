const { body, query, validationResult } = require("express-validator");

const tagDataValidation = [
  body("name")
    .notEmpty()
    .withMessage("Please provide tag data")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .isLength({ max: 255 })
    .withMessage("Name must not exceed 255 characters"),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { tagDataValidation, handleValidationErrors };
