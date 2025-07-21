import XLSX from 'xlsx';
import Client from '../models/Client.model.js';
import Commande from '../models/Commande.model.js';
import Produit from '../models/productExel.model.js';
import Confirmer from '../models/Confirmer.model.js';
import { cleanUpFile } from '../utils/fileUtils.js';

export const importDataFromExcel = async (file) => {
    const filePath = file.path;
    let processedCount = 0;
    let skippedCount = 0;
    const errors = [];

    try {
        const workbook = XLSX.readFile(filePath);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);

        for (const row of data) {
            try {
                if (!validateRow(row)) {
                    skippedCount++;
                    errors.push(`Ligne ignorée - Données manquantes: ${JSON.stringify(row)}`);
                    continue;
                }

                const [client, commande, produit] = await Promise.all([
                    processClient(row),
                    processCommande(row),
                    processProduit(row)
                ]);

                await processConfirmer(row, client._id, commande._id, produit._id);
                processedCount++;
            } catch (error) {
                skippedCount++;
                errors.push(`Erreur traitement ligne: ${error.message}`);
            }
        }

        return {
            success: true,
            message: 'Importation terminée',
            stats: {
                total: data.length,
                processed: processedCount,
                skipped: skippedCount
            },
            errors: errors.length > 0 ? errors : undefined
        };
    } finally {
        cleanUpFile(filePath);
    }
};

const validateRow = (row) => {
    return row['Lead ID'] && row['Reference'] && row['Customer Phone'];
};

const processClient = async (row) => {
    return Client.findOneAndUpdate(
        { customerPhone: row['Customer Phone'] },
        {
            customerName: row['Customer Name'],
            customerPhone: row['Customer Phone'],
            customerCity: row['Customer City'] || '',
            customerCountry: row['Customer Country'] || ''
        },
        { upsert: true, new: true }
    );
};

const processCommande = async (row) => {
    return Commande.findOneAndUpdate(
        { leadID: row['Lead ID'] },
        {
            status: row['Status'],
            shippedAt: row['Shipped at'] || null,
            deliveredAt: row['Delivered at'] || null,
            returnedAt: row['Returned at'] || null,

        },
        { upsert: true, new: true }
    );
};

const processProduit = async (row) => {
    return Produit.create({
        sku: row['SKU'],
        productName: row['Products'],
        quantity: row['Quantity'] || 0,
        total: row['Total'] || 0
    });
};

const processConfirmer = async (row, clientId, commandeId, produitId) => {
    return Confirmer.findOneAndUpdate(
        { reference: row['Reference'] },
        {
            clientId,
            commandeId,
            produitId,
            reference: row['Reference']
        },
        { upsert: true }
    );
};
