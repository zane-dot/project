import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getTrends,
} from '../controllers/transactionController';
import { importCsv, exportCsv, upload } from '../controllers/csvController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// IMPORTANT: declare more specific routes BEFORE '/:id'-style ones to avoid shadowing.
router.get('/summary', getSummary);
router.get('/trends', getTrends);
router.get('/export', exportCsv);
router.post('/import', upload.single('file'), importCsv);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

export default router;
