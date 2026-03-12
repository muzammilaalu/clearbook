import { Router }      from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  getSuppliers,
  createSupplier,
  bulkCreateSuppliers,
  exportSuppliers,
} from '../controllers/supplierController.js';

const router = Router();
router.use(requireAuth);

router.get('/',        getSuppliers);
router.get('/export',  exportSuppliers);
router.post('/',       createSupplier);
router.post('/bulk',   bulkCreateSuppliers);

export default router;