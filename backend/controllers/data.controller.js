import { getAllData } from '../services/data.service.js';

export const getData = async (req, res) => {
    try {
        const data = await getAllData();
        res.status(200).json(data);
    } catch (error) {
        console.error('❌ Erreur serveur:', error.message);
        res.status(500).json({
            error: 'Erreur serveur lors de la récupération des données',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};