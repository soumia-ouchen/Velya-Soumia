import Client from '../models/Client.model.js';
import Commande from '../models/Commande.model.js';
import Produit from '../models/productExel.model.js';
import Confirmer from '../models/Confirmer.model.js';

export const getAllData = async () => {
    const [confirmer, clients, commandes, produits] = await Promise.all([
        Confirmer.find()
            .populate('produitId')
            .populate('clientId')
            .populate('commandeId'),
        Client.find().select('-password'),
        Commande.find(),
        Produit.find()
    ]);

    return { clients, commandes, produits, confirmer };
};