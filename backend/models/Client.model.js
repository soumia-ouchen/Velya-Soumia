import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
    whatsappId: {
        type: String,
        unique: true, // Ensures no duplicate WhatsApp IDs
        sparse: true  // Allows this field to be null for clients without a WhatsApp ID
    },
    customerName: String,
    customerPhone: String,
    customerCity: String,
    customerCountry: String,
}, {
    timestamps: true
});

const Client = mongoose.model('Client', ClientSchema);

export default Client;
