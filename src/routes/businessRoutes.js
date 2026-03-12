// src/routes/businessRoutes.js

import { Router }        from 'express';
import { requireAuth }   from '../middleware/requireAuth.js';
import { getBusinesses } from '../controllers/businessController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getBusinesses);

export default router;