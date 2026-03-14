// src/routes/salesRoutes.js

import { Router }                                        from 'express';
import { requireAuth }                                   from '../middleware/requireAuth.js';
import { getSales, createSale, getSalesAttachments }     from '../controllers/salesController.js';

const router = Router();
router.use(requireAuth);

router.get('/',             getSales);
router.post('/',            createSale);
router.get('/attachments',  getSalesAttachments);  // ← NEW

export default router;
