import express from 'express';
import {
  getDashboardStats,
  getGeographicStats,
  getOfferStats
} from '../controllers/stats.controller.js ';

const router = express.Router();

// Route pour les statistiques du dashboard
router.get('/dashboard', getDashboardStats);

// Route pour les statistiques géographiques
router.get('/geographic', getGeographicStats);

// Route pour les statistiques des offres
router.get('/offers', getOfferStats);

export default router;