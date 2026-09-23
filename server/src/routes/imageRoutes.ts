import { Router } from 'express';
import { ImageController } from '../controllers/imageController.js';
import { upload, validateImageIntegrity } from '../middleware/upload.js';

const router = Router();

router.get('/status', ImageController.status);
router.post('/analyze', upload.single('image'), validateImageIntegrity, ImageController.analyze);
router.post('/enhance', upload.single('image'), validateImageIntegrity, ImageController.enhance);
router.post('/upscale', upload.single('image'), validateImageIntegrity, ImageController.upscale);
router.post('/export', upload.single('image'), validateImageIntegrity, ImageController.exportImage);

export default router;
