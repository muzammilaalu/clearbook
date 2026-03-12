import { Router }      from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  getCustomers,
  createCustomer,
  bulkCreateCustomers,
  exportCustomers,
} from '../controllers/customerController.js';

const router = Router();
router.use(requireAuth);

router.get('/',        getCustomers);
router.get('/export',  exportCustomers);   // ← new
router.post('/',       createCustomer);
router.post('/bulk',   bulkCreateCustomers);

export default router;