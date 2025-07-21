import express from 'express';
import { createFAQ, getAllFAQs, updateFAQ, deleteFAQ } from '../controllers/faq.controller.js';

const router = express.Router();

router.post('/', createFAQ);
router.get('/', getAllFAQs);
router.put('/:id', updateFAQ);
router.delete('/:id', deleteFAQ);
router.put('/:id', updateFAQ);

export default router;
