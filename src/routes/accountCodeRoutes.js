import { Router }      from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { getAccountCodes, getVatRates } from '../controllers/accountCodeController.js';

const router = Router();
router.use(requireAuth);

router.get('/',         getAccountCodes);
router.get('/vat-rates', getVatRates);

export default router;