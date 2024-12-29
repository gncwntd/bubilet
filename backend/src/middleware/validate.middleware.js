const { body, validationResult } = require('express-validator');

exports.validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Kullanıcı adı en az 3 karakter olmalıdır'),
    body('email')
        .isEmail()
        .withMessage('Geçerli bir e-posta adresi giriniz'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Şifre en az 6 karakter olmalıdır'),
    body('phone_number')
        .matches(/^\d{10}$/)
        .withMessage('Geçerli bir telefon numarası giriniz (10 haneli)'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }
        next();
    }
];

exports.validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Geçerli bir e-posta adresi giriniz'),
    body('password')
        .exists()
        .withMessage('Şifre gereklidir'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }
        next();
    }
]; 