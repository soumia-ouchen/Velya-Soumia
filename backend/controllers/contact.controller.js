import { sendEmail } from "../services/contact.service.js";


// import Contact from "../models/Contact.js"; // si DB utilisée

export const handleContact = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Tous les champs sont requis." });
  }

  try {
    console.log("Données du formulaire de contact:", req.body);
    console.log("Nom:", name);
    console.log("Email:", email);
    console.log("Message:", message);
    await sendEmail({ name, email, message });
    console.log("Email envoyé avec succès !");
    

    // Optionnel : stocker dans la DB
    // await Contact.create({ name, email, message });

    res.status(200).json({ message: "Message envoyé avec succès !" });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
};