import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode";
import { connectDB } from './db.js';
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Chat from "../models/Chat.model.js";
import OfferHistory from "../models/OfferHistory.model.js";
import OpenRouterService from '../services/openrouter.service.js';
import { franc } from 'franc';

// Connexion à MongoDB
connectDB();

let connectionState = {
  qrCode: "",
  status: "disconnected",
  lastError: null,
  clientState: null,
  userInfo: null
};

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: "./sessions" }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2407.3.html'
  }
});

// Génération QR code
client.on("qr", (qr) => {
  connectionState.status = "connecting";
  qrcode.toDataURL(qr, (err, url) => {
    if (err) {
      console.error("QR Code error:", err);
      connectionState.lastError = "QR Code generation failed";
      return;
    }
    connectionState.qrCode = url;
    console.log("QR Code generated");
  });
});

// Client prêt
client.on("ready", () => {
  console.log("✅ Client is ready!");
  connectionState.status = "connected";
  connectionState.qrCode = "";
  connectionState.lastError = null;
  connectionState.userInfo = {
    wid: client.info.wid,
    pushname: client.info.pushname,
    platform: client.info.platform
  };
});

// Client déconnecté
client.on("disconnected", (reason) => {
  console.log("Client disconnected:", reason);
  connectionState.status = "disconnected";
  connectionState.lastError = reason;
});

const initializeClient = () => {
  try {
    client.initialize();
  } catch (error) {
    console.error("Initialization error:", error);
    connectionState.status = "failed";
    connectionState.lastError = error.message;
  }
};

const logoutClient = async () => {
  try {
    await client.logout();
    await client.destroy();
    connectionState.status = "disconnected";
    connectionState.qrCode = "";
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    connectionState.lastError = error.message;
    return false;
  }
};

client.getState = () => {
  if (connectionState.status === "connected") return "CONNECTED";
  if (connectionState.status === "connecting") return "CONNECTING";
  return "DISCONNECTED";
};

// === Partie modifiée : gestion des messages ===
client.on('message', async (msg) => {
  if (msg.fromMe || msg.isStatus) return;

  const text = msg.body.toLowerCase().trim();

  try {
    // Récupérer tous les produits de la base (uniquement les noms)
    const products = await Product.find({}, { name: 1, _id: 0 });
    // Chercher si un nom produit apparaît dans le texte
    let foundProduct = null;

    for (const prod of products) {
      if (!prod.name) continue;
      // Vérifier présence exacte insensible à la casse
      const prodNameLower = prod.name.toLowerCase();
      if (text.includes(prodNameLower)) {
        foundProduct = prodNameLower;
        break;
      }
    }

    if (foundProduct) {
      // Trouver le produit complet dans la base (cas sensible non strict)
      const product = await Product.findOne({ name: new RegExp(`^${foundProduct}$`, 'i') });
      if (product) {
        await msg.reply(`💰 Le prix de ${product.name} est ${product.price} MAD.`);
      } else {
        await msg.reply(`❌ Produit "${foundProduct}" introuvable dans la base.`);
      }
    } else {
      // Si aucun produit détecté, utiliser IA pour répondre
      const response = await OpenRouterService.generateResponse(text, msg.from, msg);
      await msg.reply(response);
    }

    // Sauvegarder conversation
    await Chat.create({
      user: msg.from,
      message: text,
      response: foundProduct ? `Prix envoyé pour ${foundProduct}` : response,
      metadata: { language: franc(text, { minLength: 1 }) }
    });

  } catch (err) {
    console.error('Erreur traitement message:', err);
    await msg.reply('⚠️ Je n’ai pas compris votre message. Pouvez-vous reformuler ?');
  }
});


// Mise à jour statut lecture message
client.on('message_ack', async (msg, ack) => {
  if (ack === 2) {
    try {
      await OfferHistory.findOneAndUpdate(
        { messageId: msg.id._serialized },
        { status: 'read', readAt: new Date() }
      );
      console.log(`Message ${msg.id._serialized} marqué comme lu`);
    } catch (error) {
      console.error('Erreur mise à jour lecture :', error);
    }
  }
});

function getClientStatus() {
  return client?.info ? 'connected' : 'disconnected';
}

const sendOffer = async (phoneNumber, offerText) => {
  try {
    const chatId = `${phoneNumber}@c.us`;
    const sentMessage = await client.sendMessage(chatId, offerText);

    console.log(`📤 Offre envoyée à ${phoneNumber}`);

    await OfferHistory.create({
      phoneNumber,
      offerText,
      messageId: sentMessage.id._serialized,
      status: 'sent',
      sentAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error("Erreur envoi offre :", error);
    return { success: false, error: error.message };
  }
};

export {
  client,
  connectionState,
  initializeClient,
  logoutClient,
  getClientStatus,
  sendOffer
};
