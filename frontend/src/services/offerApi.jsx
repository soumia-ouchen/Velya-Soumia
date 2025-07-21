import api from './api';

const offerApi = {
  /**
   * Récupère toutes les offres
   * @returns {Promise} Liste des offres
   */
  getAllOffers() {
    return api.get('/offers')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching offers:', error);
        throw error;
      });
  },

  /**
   * Récupère une offre spécifique
   * @param {string} id - ID de l'offre
   * @returns {Promise} Détails de l'offre
   */
  getOfferById(id) {
    return api.get(`/offers/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error fetching offer ${id}:`, error);
        throw error;
      });
  },

  /**
   * Crée une nouvelle offre
   * @param {FormData} formData - Données du formulaire (peut inclure une image)
   * @returns {Promise} Nouvelle offre créée
   */
  createOffer(formData) {
    return api.post('/offers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => response.data)
    .catch(error => {
      console.error('Error creating offer:', error);
      throw error;
    });
  },

  /**
   * Met à jour une offre existante
   * @param {string} id - ID de l'offre
   * @param {FormData} formData - Données du formulaire (peut inclure une image)
   * @returns {Promise} Offre mise à jour
   */
  updateOffer(id, formData) {
    return api.put(`/offers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => response.data)
    .catch(error => {
      console.error(`Error updating offer ${id}:`, error);
      throw error;
    });
  },

  /**
   * Supprime une offre
   * @param {string} id - ID de l'offre
   * @returns {Promise} Résultat de la suppression
   */
  deleteOffer(id) {
    return api.delete(`/offers/${id}`)
      .then(response => response.data)
      .catch(error => {
        console.error(`Error deleting offer ${id}:`, error);
        throw error;
      });
  },

  /**
   * Envoie une offre via WhatsApp
   * @param {string} offerId - ID de l'offre à partager
   * @returns {Promise} Résultat de l'envoi
   */
  shareOfferViaWhatsApp(offerId) {
    return api.post('/whatsapp/send-offer', { offerId });
   
  }
  
};

export default offerApi;