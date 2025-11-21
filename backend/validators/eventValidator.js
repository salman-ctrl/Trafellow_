const { body } = require('express-validator');

exports.createEventValidation = [
  body('title').notEmpty().withMessage('Judul event wajib diisi'),
  body('description').notEmpty().withMessage('Deskripsi wajib diisi'),
  body('event_date').isDate().withMessage('Format tanggal tidak valid'),
  body('event_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Format waktu tidak valid (HH:MM)'),
  body('max_participants').isInt({ min: 1 }).withMessage('Jumlah peserta minimal 1'),
  body('region_id').isInt().withMessage('Region ID harus berupa angka'),
  body('meeting_point').notEmpty().withMessage('Meeting point wajib diisi')
];