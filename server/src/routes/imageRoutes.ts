import { Router } from 'express';
import { ImageController } from '../controllers/imageController.js';
import {
  upload,
  uploadWithReferences,
  validateImageIntegrity,
  validateMultiImageIntegrity,
} from '../middleware/upload.js';

const router = Router();
const uploadSingle = upload.single('image') as any;
const integrity = validateImageIntegrity as any;
const uploadMulti = uploadWithReferences as any;
const multiIntegrity = validateMultiImageIntegrity as any;

router.get('/status', ImageController.status as any);
router.post('/analyze', uploadSingle, integrity, ImageController.analyze as any);
router.post('/enhance', uploadSingle, integrity, ImageController.enhance as any);
router.post('/upscale', uploadSingle, integrity, ImageController.upscale as any);
router.post('/export', uploadSingle, integrity, ImageController.exportImage as any);
router.post('/generate', ImageController.generateNanoBanana as any);
router.post('/ai-edit', uploadMulti, multiIntegrity, ImageController.editNanoBanana as any);
router.post('/edit', uploadMulti, multiIntegrity, ImageController.editNanoBanana as any);
router.post('/remove-background', uploadSingle, integrity, ImageController.removeBackgroundNanoBanana as any);

export default router;

