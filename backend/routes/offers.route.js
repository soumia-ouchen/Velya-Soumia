import express from "express";  
import { upload } from '../middlewares/upload.js';
import {
    getAllOffers, createOffer, getOfferById,
    updateOffer, deleteOffer
} from '../controllers/offer.controller.js';


const router = express.Router();

router.get('/', getAllOffers);
router.get('/:id', getOfferById);
router.post('/', upload.fields([{ name: 'image' }]), createOffer);
router.put('/:id', upload.fields([{ name: 'image' }]), updateOffer);
router.delete('/:id', deleteOffer);

export default router;
