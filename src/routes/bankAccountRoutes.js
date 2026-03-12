// src/routes/bankAccountRoutes.js

import { Router }           from 'express';
import { requireAuth }      from '../middleware/requireAuth.js';
import { getBankAccounts }  from '../controllers/bankAccountController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getBankAccounts);

export default router;