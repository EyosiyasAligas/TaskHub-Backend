const { body, query, validationResult } = require("express-validator");

const noteDataValidation = [
  body().notEmpty().withMessage("Please provide note data"),
  body("title").optional().isString().trim().isLength({ max: 255 }),
  body("content").optional().isString(),
  body("todoItems").optional().isArray(),
  body("collaborators").optional().isArray(),
  body("tags").optional().isArray(),
  body("color").optional().isString().isLength({ min: 1, max: 20 }),
  body("reminder").optional().isString(),
  body("isPinned").optional().isBoolean(),
  body("isArchived").optional().isBoolean(),
  body("isTodo").optional().isBoolean(),
  query("userId").notEmpty(),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  const title = req.body.title;
  const content = req.body.content;
  const todoItems = req.body.todoItems;

  // check if body is empty

  const bodyKeys = Object.keys(req.body);
  const allowedFields = [
    "title",
    "content",
    "todoItems",
    "collaborators",
    "tags",
    "color",
    "reminder",
    "isPinned",
    "isArchived",
    "isTodo",
  ];

  if (bodyKeys.length === 0) {
    return res
      .status(400)
      .json({ message: "Request body is required and cannot be empty" });
  }

  const unexpectedKeys = bodyKeys.filter((key) => !allowedFields.includes(key));

  if (unexpectedKeys.length > 0) {
    return res.status(400).json({
      message: `Request body contains unexpected fields: ${unexpectedKeys.join(", ")}`,
      unexpectedKeys,
      allowedFields,
    });
  }

  if (!title && !content && !todoItems && req.method === "POST") {
    return res
      .status(400)
      .json({ message: "Please provide title or content or todoItems" });
  }

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { noteDataValidation, handleValidationErrors };
