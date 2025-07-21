import FAQ from '../models/faq.model.js';

class FAQService {
  /**
   * Crée une nouvelle FAQ
   */
  static async createFAQ(question, answer) {
    // Vérification de l'unicité
    const existing = await FAQ.findOne({ question });
    if (existing) {
      throw new Error('Cette question existe déjà dans les FAQs');
    }

    return await FAQ.create({ question, answer });
  }

  /**
   * Récupère toutes les FAQs
   */
  static async getAllFAQs() {
    return await FAQ.find().sort({ createdAt: -1 });
  }

  /**
   * Met à jour une FAQ
   */
  static async updateFAQ(id, { question, answer }) {
    // Vérifie que la nouvelle question n'existe pas déjà (sauf pour l'élément courant)
    if (question) {
      const existing = await FAQ.findOne({ 
        question, 
        _id: { $ne: id } 
      });
      if (existing) {
        throw new Error('Cette question existe déjà dans les FAQs');
      }
    }

    const faq = await FAQ.findByIdAndUpdate(
      id,
      { question, answer },
      { new: true, runValidators: true }
    );

    if (!faq) throw new Error("FAQ non trouvée");
    return faq;
  }

  /**
   * Supprime une FAQ
   */
  static async deleteFAQ(id) {
    const result = await FAQ.findByIdAndDelete(id);
    if (!result) throw new Error("FAQ non trouvée");
    return result;
  }

  /**
   * Recherche dans les FAQs
   */
  static async searchFAQs(searchTerm) {
    return await FAQ.find(
      { $text: { $search: searchTerm } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } });
  }
}

export default FAQService;