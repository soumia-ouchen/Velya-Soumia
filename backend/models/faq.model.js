import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'La question est obligatoire'],
      unique: true,
      trim: true,
        },
    answer: {
      type: String,
      required: [true, 'La réponse est obligatoire'],
      trim: true,
      }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances de recherche
faqSchema.index({ question: 'text', answer: 'text' });

const FAQ = mongoose.model('FAQ', faqSchema, 'faqs');
export default FAQ;