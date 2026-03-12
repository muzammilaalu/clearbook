// src/routes/purchaseRoutes.js

import { Router }        from 'express';
import { requireAuth }   from '../middleware/requireAuth.js';
import { getPurchases }  from '../controllers/purchaseController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getPurchases);

export default router;