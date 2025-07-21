import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";

import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// 📁 Initialisation
const app = express();
const server = http.createServer(app);
dotenv.config();
connectDB();

// 📍 Récupération du chemin absolu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔧 Middlewares globaux
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// 📂 Fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 🔌 Routes
import productRoutes from "./routes/product.route.js";
import whatsappRoutes from "./routes/whatsapp.route.js";
import offersRoutes from "./routes/offers.route.js";
import messageRoutes from "./routes/message.route.js";
import excelRoutes from './routes/excel.routes.js';
import dataRoutes from './routes/data.routes.js';
import statsRoutes from './routes/stats.route.js';
import faqRoutes from './routes/faq.routes.js';
import apiRoutes from './routes/api.js';
import contactRoutes from './routes/contact.route.js';
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/client.route.js";
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/offers", offersRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api', apiRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/clients',clientRoutes)
// 🔁 Route de test
app.get("/", (req, res) => {
    res.send("✅ API en ligne !");
});

// ⚠️ Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Erreur serveur interne" });
});

// 🚀 Démarrage du serveur
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur en cours sur http://localhost:${PORT}`);
});
export default app;
export { server };