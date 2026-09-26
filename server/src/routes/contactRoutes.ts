import { Router } from 'express';
import { ContactController } from '../controllers/contactController.js';
import { contactUpload } from '../middleware/contactUpload.js';

const router = Router();
const uploadAttachment = contactUpload.single('attachment') as any;

// Submit a contact inquiry / support ticket (accepts optional attachment)
router.post(
  '/',
  (req: any, res: any, next: any) => {
    // Gracefully handle file upload errors (e.g. invalid format or size)
    uploadAttachment(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({
          error: 'Attachment upload failed',
          details: err.message || 'File upload error',
        });
      }
      next();
    });
  },
  ContactController.submit as any
);

// Get available topics & active support SLAs
router.get('/topics', ContactController.getTopics as any);

// Check status of a ticket by ticket ID
router.get('/tickets/:ticketId', ContactController.getTicket as any);

// List recent tickets
router.get('/tickets', ContactController.listRecent as any);

export default router;
