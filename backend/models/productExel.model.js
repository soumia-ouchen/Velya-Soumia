import mongoose from 'mongoose';

const ProduitSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: String, required: true },
    total: { type: Number, required: true }
});

const Produit = mongoose.model('Produit', ProduitSchema);

export default Produit;
