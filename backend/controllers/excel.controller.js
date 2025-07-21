import { importDataFromExcel } from '../services/excel.service.js';

export const importData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Aucun fichier n'a été fourni." });
        }

        const result = await importDataFromExcel(req.file);
        res.status(200).json(result);
    } catch (error) {
        console.error("Erreur lors de l'importation :", error);
        res.status(500).json({
            error: "Erreur lors du traitement du fichier",
            details: error.message
        });
    }
};