import mongoose from 'mongoose';

const offerHistorySchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  offerText: { type: String, required: true },
  sentAt: { type: Date, default: Date.now }
});

const OfferHistory = mongoose.model('OfferHistory', offerHistorySchema);
export default OfferHistory;
