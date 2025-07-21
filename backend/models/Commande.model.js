import mongoose from 'mongoose';


const CommandeSchema = new mongoose.Schema({
    leadID: {
        type: Number, required: true, unique: true
    },
    status: { type: String, required: true },
    statusMsg: { type: Boolean, default: false },
    shippedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    returnedAt: { type: Date, default: null }

}, { timestamps: true, strict: false }); 

const Commande = mongoose.model('Commande', CommandeSchema);

export default Commande;
