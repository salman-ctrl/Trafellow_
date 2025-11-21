const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = [
  'public/uploads/profiles',
  'public/uploads/destinations',
  'public/uploads/events',
  'public/uploads/regions',
  'public/uploads/chat',
  'public/uploads/dm'
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'public/uploads/';
    
    if (file.fieldname === 'profile_picture') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'event_image') {
      uploadPath += 'events/';
    } else if (file.fieldname === 'destination_image') {
      uploadPath += 'destinations/';
    } else if (file.fieldname === 'region_image') {
      uploadPath += 'regions/';
    } else if (file.fieldname === 'chat_file') {
      uploadPath += 'chat/';
    } else if (file.fieldname === 'dm_file') {
      uploadPath += 'dm/';
    } else {
      uploadPath += 'others/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;