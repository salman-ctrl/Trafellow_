const { body } = require('express-validator');

exports.updateProfileValidation = [
  body('name').optional().notEmpty().withMessage('Nama tidak boleh kosong'),
  body('bio').optional(),
  body('location').optional()
];