// controllers/whatsapp.controller.js
import Commande from "../models/Commande.model.js";
import Message from "../models/Message.model.js";
import ClientModel from '../models/Client.model.js';
import OfferModel from '../models/Offer.model.js'; // adapte si nécessaire
import pkg from 'whatsapp-web.js';


const { MessageMedia } = pkg;


import {
    client as whatsappClient,
    connectionState,
    initializeClient,
    logoutClient
} from "../config/whatsappConfig.js";

// Nouvelle route pour l'état de connexion
export const getConnectionStatus = async (req, res) => {
    try {
        return res.json({
            status: connectionState.status,
            qrCode: connectionState.qrCode,
            error: connectionState.lastError,
            isConnected: connectionState.status === "connected"
        });
    } catch (error) {
        console.error("Status check error:", error);
        return res.status(500).json({ error: "Failed to check status" });
    }
};

// Route pour initialiser la connexion
export const initConnection = async (req, res) => {
    try {
        if (connectionState.status === "connected") {
            return res.json({ message: "Already connected" });
        }

        initializeClient();
        return res.json({ message: "Initialization started" });
    } catch (error) {
        console.error("Init error:", error);
        return res.status(500).json({ error: error.message });
    }
};

// Route pour déconnexion
export const logout = async (req, res) => {
    try {
        const success = await logoutClient();
        if (success) {
            return res.json({ message: "Successfully disconnected" });
        }
        return res.status(500).json({ error: "Failed to disconnect" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ error: error.message });
    }
};

// (Garder les autres fonctions existantes...)
// Server-side (sendMessage route)
export const sendMessage = async (req, res) => {
    const messages = Array.isArray(req.body) ? req.body : [req.body];
    
    const results = [];
    for (const { number, message, orderId } of messages) {
        try {
            if (!number || !message || !orderId) {
                results.push({ success: false, error: "Missing fields" });
                continue;
            }

            const internationalNumber = number.startsWith("+") ? number : `+${number}`;
            const cleanNumber = internationalNumber.replace(/\D/g, "");
            const chatId = `${cleanNumber}@c.us`;

            const commande = await Commande.findById(orderId);
            if (!commande) {
                results.push({ success: false, error: "Order not found" });
                continue;
            }

            if (commande.statusMsg) {
                results.push({ success: true, message: "Already sent" });
                continue;
            }

            await whatsappClient.sendMessage(chatId, message);
            commande.statusMsg = true;
            await commande.save();
            
            results.push({ success: true });
        } catch (error) {
            console.error(`Error sending to ${number}:`, error);
            results.push({ success: false, error: error.message });
        }
    }

    return res.status(200).json({ results });
};

export const getQRCode = (req, res) => {
    try {
        if (!getQRCodeData) {
            return res.status(503).json({ error: "QR Code non disponible" });
        }
        return res.json({ qr: getQRCodeData });
    } catch (error) {
        console.error("Erreur QR Code:", error);
        return res.status(500).json({ error: "Erreur serveur" });
    }
};

export const sendOfferToAllClients = async (req, res) => {
    const { offerId } = req.body;
    const isTest = req.query.test === 'true';


    try {
        const offer = await OfferModel.findById(offerId);
        if (!offer) return res.status(404).json({ message: 'العرض غير موجود' });

        if (offer.statusSend) {
            return res.status(400).json({ message: 'تم إرسال هذا العرض مسبقًا' });
        }
        const clients = await ClientModel.find();
        if (!clients.length) return res.status(400).json({ message: 'لا يوجد عملاء لإرسال العرض إليهم' });

        // 📝 Construction du message
        let message = '';
        if (offer.text && offer.storeUrl) {
            message = `🔥 عرض جديد لك!\n\n${offer.text}\n🛒 رابط المتجر: ${offer.storeUrl}`;
        } else if (offer.text) {
            message = offer.text;
        } else if (offer.storeUrl) {
            message = `🛒 رابط المتجر: ${offer.storeUrl}`;
        }

        // 📦 Construction des médias (image, vidéo)
        const mediaList = [];

        const loadMediaFromUrl = async (url, type) => {
            try {
                const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
                return await MessageMedia.fromUrl(fullUrl);
            } catch (e) {
                console.warn(`⚠️ Impossible de charger le média ${type} : ${e.message}`);
                return null;
            }
        };

        if (offer.image) {
            const imageMedia = await loadMediaFromUrl(offer.image, 'image');
            if (imageMedia) mediaList.push(imageMedia);
        }

        if (offer.video) {
            const videoMedia = await loadMediaFromUrl(offer.video, 'video');
            if (videoMedia) mediaList.push(videoMedia);
        }

        const targetClients = isTest ? [clients[0]] : clients;

        // 🧑‍🤝‍🧑 Envoi à chaque client
        for (const client of targetClients) {
            const rawPhone = client.customerPhone;
            const cleanPhone = rawPhone.replace(/\D/g, "");

            if (!cleanPhone || cleanPhone.length < 8) {
                console.warn(`⚠️ Numéro invalide ignoré : ${rawPhone}`);
                continue;
            }

            const chatId = `${cleanPhone}@c.us`;

            try {

                // Envoi des médias
                for (const media of mediaList) {
                    await whatsappClient.sendMessage(chatId, media);
                    offer.statusSend = true;
                    await offer.save();
                }

                // Envoi du message texte
                if (message) {
                    await whatsappClient.sendMessage(chatId, message);
                    offer.statusSend = true;
                    await offer.save();
                }

            } catch (err) {
                console.error(`❌ Échec d'envoi à ${cleanPhone} : ${err.message}`);
            }

            if (!isTest) await new Promise(res => setTimeout(res, 1500)); // Anti-spam seulement en mode normal
        }

        res.json({
            message: isTest
                ? '✅ رسالة اختبارية تم إرسالها إلى العميل الأول'
                : '✅ تم إرسال الرسائل إلى جميع العملاء'
        });
    } catch (error) {
        console.error('❌ Erreur dans sendOfferToAllClients :', error);
        res.status(500).json({ message: '❌ حدث خطأ أثناء إرسال الرسائل' });
    }
};


export const sendMessageToClient = async (req, res) => {
    try {
        const { messageId } = req.body;

        if (!messageId) {
            return res.status(400).json({
                success: false,
                error: "Message ID is required"
            });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });

        }
        if (message.statusSend) {
            return res.status(400).json({
                success: false,
                error: "Message already sent"
            });
        }

        const clients = await ClientModel.find();
        if (!clients.length) {
            return res.status(200).json({
                success: true,
                message: "No clients found to send message to"
            });
        }

        const results = {
            total: clients.length,
            success: 0,
            failed: 0,
            failedNumbers: []
        };

        for (const client of clients) {
            const rawPhone = client.customerPhone;
            const cleanPhone = rawPhone.replace(/\D/g, "");
            const chatId = `${cleanPhone}@c.us`;

        const messageEnvoyé = message.title+"\n"+message.content;
            try {
                await whatsappClient.sendMessage(chatId, messageEnvoyé);
                message.statusSend = true;
                await message.save();
                console.log(`Message sent to ${client.customerPhone}`);
                results.success++;
            } catch (error) {
                console.error(`Failed to send to ${client.customerPhone}:`, error);
                results.failed++;
                results.failedNumbers.push(client.customerPhone);
            }

            await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
        }

        return res.json({
            success: true,
            message: "Messages sent to clients",
            results
        });

    } catch (error) {
        console.error("Error in sendMessageToClient:", error);
        return res.status(500).json({
            success: false,
            error: "Failed to send messages"
        });
    }
};


export const checkSession = async (req, res) => {
    try {
        // Vérification plus robuste du client
        if (!whatsappClient || !whatsappClient.initialize) {
            console.error('Client WhatsApp non disponible');
            return res.status(503).json({
                valid: false,
                error: "Service WhatsApp non disponible"
            });
        }

        // Vérification améliorée de l'état
        const state = whatsappClient.getState();
        const isAuthenticated = state === 'CONNECTED';
        const isConnecting = state === 'CONNECTING';
        const isDisconnected = state === 'DISCONNECTED';

        // Récupération des infos utilisateur si connecté
        let userInfo = null;
        if (isAuthenticated && whatsappClient.info) {
            userInfo = {
                wid: whatsappClient.info.wid,
                pushname: whatsappClient.info.pushname,
                platform: whatsappClient.info.platform,
                phone: whatsappClient.info.me?.user
            };
        }

        return res.json({
            valid: isAuthenticated,
            authenticated: isAuthenticated,
            connected: isAuthenticated,
            connecting: isConnecting,
            disconnected: isDisconnected,
            userInfo,
            qrCode: connectionState.qrCode,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Erreur vérification session:", error);
        return res.status(500).json({
            valid: false,
            error: error.message || "Erreur serveur lors de la vérification"
        });
    }
};

