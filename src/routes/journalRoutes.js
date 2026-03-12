import { Router }      from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { createJournal, bulkCreateJournals } from '../controllers/journalController.js';

const router = Router();
router.use(requireAuth);

router.post('/',      createJournal);
router.post('/bulk',  bulkCreateJournals);

export default router;