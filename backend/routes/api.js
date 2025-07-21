import { Router } from 'express';
import { getClientStatus } from '../config/whatsappConfig.js';
import Chat from '../models/Chat.model.js';

const router = Router();
 
// Get chat history
router.get('/chats/:user', async (req, res) => {
  try {
    const chats = await Chat.find({ user: req.params.user })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de base de données' });
  }
});

// Check status
router.get('/status', (req, res) => {
  res.json({ status: getClientStatus() });
});

export default router;