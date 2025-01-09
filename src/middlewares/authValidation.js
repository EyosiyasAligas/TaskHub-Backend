const {body, validationResult} = require('express-validator');

const authValidation = [
    body('email').isEmail().trim().withMessage('Please provide a valid email address'),
    body('password').isString().trim().notEmpty().withMessage('Please enter password').isLength({min: 6, max: 255}).withMessage('Password must be at least 6 characters long'),
];

const handleValidationErrors = (req, res, next) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {authValidation, handleValidationErrors};