// src/routes/salesRoutes.js

import { Router }      from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getSales, createSale, getSalesAttachments, uploadSalesAttachment, getRefundPayments } from '../controllers/salesController.js';

const router = Router();
router.use(requireAuth);

router.get('/',                     getSales);
router.post('/',                    createSale);
router.get('/refunds',              getRefundPayments);       // ← NEW
router.get('/attachments',          getSalesAttachments);
router.post('/attachments/upload',  uploadSalesAttachment);

export default router;