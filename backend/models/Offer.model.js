import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  text: { type: String },
  storeUrl: { type: String },
  image: { type: String },
  statusSend: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema, 'offers');

export default Offer;