import express from 'express';
import Chat from '../models/Chat.model.js';

const router = express.Router();

// Route pour récupérer l'historique des interactions d'un client
router.get('/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const chats = await Chat.find({ user: phone })
      .sort({ timestamp: -1 })
      .limit(50);  // Les 50 derniers messages
    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des interactions.' });
  }
});

export default router;
