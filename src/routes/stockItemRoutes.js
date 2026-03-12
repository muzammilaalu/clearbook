import { Router }      from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  getStockItems,
  createStockItem,
  bulkCreateStockItems,
  exportStockItems,
} from '../controllers/stockItemController.js';

const router = Router();
router.use(requireAuth);

router.get('/',       getStockItems);
router.get('/export', exportStockItems);
router.post('/',      createStockItem);
router.post('/bulk',  bulkCreateStockItems);

export default router;