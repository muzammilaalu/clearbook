// src/routes/salesRoutes.js

import { Router }                  from 'express';
import { requireAuth }             from '../middleware/requireAuth.js';
import { getSales, createSale }    from '../controllers/salesController.js';

const router = Router();

router.use(requireAuth);

router.get('/',  getSales);
router.post('/', createSale);

export default router;