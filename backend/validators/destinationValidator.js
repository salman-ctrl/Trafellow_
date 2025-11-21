const { body } = require('express-validator');

exports.createDestinationValidation = [
  body('name').notEmpty().withMessage('Nama destinasi wajib diisi'),
  body('description').notEmpty().withMessage('Deskripsi wajib diisi'),
  body('region_id').isInt().withMessage('Region ID harus berupa angka'),
  body('category_id').isInt().withMessage('Category ID harus berupa angka'),
  body('address').notEmpty().withMessage('Alamat wajib diisi')
];