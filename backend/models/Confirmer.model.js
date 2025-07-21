import mongoose from 'mongoose';
const { Schema } = mongoose;

const confirmerSchema = new Schema({
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    commandeId: { type: Schema.Types.ObjectId, ref: 'Commande', required: true },
    produitId: { type: Schema.Types.ObjectId, ref: 'Produit', required: true },
    reference: { type: String, required: true }
}, { timestamps: true });

// Specify the collection name explicitly to avoid pluralization
const Confirmer = mongoose.model('Confirmer', confirmerSchema, 'confirmer');

export default Confirmer;
