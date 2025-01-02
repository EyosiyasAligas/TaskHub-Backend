const router = require('express').Router();

const {register, login} = require('../../controllers/api/authController');
const {authValidation, handleValidationErrors} = require('../../middlewares/authValidation');

router.post('/login', authValidation, handleValidationErrors, login);
router.post('/signup', authValidation, handleValidationErrors, register);

module.exports = router; 