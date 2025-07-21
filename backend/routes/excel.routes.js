

// routes/yourRouteFile.js
import express from 'express';
import { importData } from '../controllers/excel.controller.js'; // Importer la fonction du contrôleur

import multer from 'multer';

const router = express.Router();

// Configuration Multer
const upload = multer({
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheetml')) {
            cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers Excel sont autorisés !'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // Limite de 5MB
    }
});

// Route pour l'importation Excel
router.post('/import', upload.single('file'), importData);

export default router;