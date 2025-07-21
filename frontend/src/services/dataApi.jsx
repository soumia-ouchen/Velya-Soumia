import api from './api';

const DataApi = {
  /**
   * Récupère toutes les commandes
   * @returns {Promise} Liste des commandes
   */
  getAllOrders() {
    return api.get('/data/afficher')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching orders:', error);
        throw error;
      });
  },


  sendWhatsAppMessages(messages) {
    console.log(messages);
    return api.post('/whatsapp/send', messages )
      .then(response => response.data)
      .catch(error => {
        console.error('Error sending WhatsApp messages:', error);
        throw error;
      });
  },

  // ... autres méthodes
};

export default DataApi;