// routes/whatsappRoutes.js
import express from 'express';
import {
    getConnectionStatus,
    initConnection, 
    checkSession,
    logout, 
    sendMessage, 
    getQRCode, 
    sendOfferToAllClients, 
    sendMessageToClient
} from '../controllers/whatsapp.controller.js';

const router = express.Router();

router.get('/status', getConnectionStatus); // Vérifier l'état de connexion
router.post('/init', initConnection); // Initialiser la connexion
router.post('/logout', logout); // Déconnecter
router.get('/check-session', checkSession);

// Route pour envoyer un message
router.post("/send", sendMessage);

// Route pour obtenir le QR Code
// Note: getQRCode est une fonction qui renvoie le QR Code pour la connexion
// au client WhatsApp
router.get("/qr", getQRCode);

router.post('/send-offer', sendOfferToAllClients);
router.post('/send-message', sendMessageToClient);


export default router;