// src/routes/salesRoutes.js

import { Router }       from 'express';
import { requireAuth }  from '../middleware/requireAuth.js';
import { getSales, createSale, getSalesAttachments, uploadSalesAttachment } from '../controllers/salesController.js';

const router = Router();
router.use(requireAuth);

router.get('/',                     getSales);
router.post('/',                    createSale);
router.get('/attachments',          getSalesAttachments);
router.post('/attachments/upload',  uploadSalesAttachment);  // ← NEW

export default router;