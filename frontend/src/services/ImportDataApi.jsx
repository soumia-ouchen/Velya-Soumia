import axios from 'axios';

export const uploadFile = async (file, leadID, reference) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('leadID', leadID);  // Ajout du leadID obligatoire
    formData.append('reference', reference);  // Ajout de la référence obligatoire

    try {
        // Envoi du fichier au serveur
        console.log("Envoi du fichier :", file);
        const response = await axios.post('http://localhost:5000/api/upload/excel', formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }// Commenté pour utiliser FormData
        });
        // Traitez la réponse du serveur ici
        console.log("Réponse du serveur :", response.data);
        // Vous pouvez également gérer la réponse selon vos besoins
        // Par exemple, retourner les données de la réponse
        return response.data;

    } catch (error) {

        console.error("Erreur lors de l'upload :", error.response?.data || error.message);

        throw error;
    }

};
