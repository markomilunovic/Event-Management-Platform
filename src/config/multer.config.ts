import { extname, join } from 'path';

import { diskStorage } from 'multer';

export const multerConfig = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      callback(null, join(__dirname, '../../uploads'));
    },
    filename: (req, file, callback) => {
      const name = file.originalname.split('.')[0];
      const fileExtName = extname(file.originalname);
      const newFileName = `${name}-${Date.now()}${fileExtName}`;
      callback(null, newFileName);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
};
