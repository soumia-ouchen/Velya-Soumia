import express from "express";
import { getAllClients, getClientsById } from "../controllers/client.controller.js";
import auth from "../middlewares/authMiddleware.js";
const router = express.Router();
router.get('/', auth, getAllClients);
router.get('/:id', auth, getClientsById);
export default router;
