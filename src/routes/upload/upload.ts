import { Router } from 'express';
import { uploadFile } from '../../controllers/upload.controller';
import { uploadMiddleware } from '../../middlewares/upload/multer';

const router = Router();
router.post('/', uploadMiddleware.single('file'), uploadFile);

export default router;
