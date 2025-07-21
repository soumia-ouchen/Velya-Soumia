import { useState, useEffect } from "react";
import Button from "../../components/common/Button";
import { TiLocationArrow } from "react-icons/ti";
import axios from "axios";
import { FiEdit, FiTrash2 } from 'react-icons/fi';

const FaqManager = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [message, setMessage] = useState({ text: "", variant: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/faqs");
      setFaqs(data);
    } catch (err) {
      console.error("Fetch FAQs error:", err);
      setMessage({ 
        text: err.response?.data?.message || "Erreur de chargement des FAQs", 
        variant: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      setMessage({ 
        text: "Veuillez remplir tous les champs.", 
        variant: "error" 
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        // Mode édition
        await axios.put(`http://localhost:5000/api/faqs/${editingId}`, { question, answer });
        setMessage({
          text: "FAQ mise à jour avec succès",
          variant: "success"
        });
      } else {
      // Mode création
        await axios.post("http://localhost:5000/api/faqs/", { question, answer });
        setMessage({
          text: "FAQ ajoutée avec succès",
          variant: "success"
        });
      }
      setQuestion("");
      setAnswer("");
      setEditingId(null);
      await fetchFaqs();
    } catch (err) {
      console.error("FAQ error:", err);
      setMessage({ 
        text: err.response?.data?.message || "Erreur lors de l'opération", 
        variant: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (faq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setEditingId(faq._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette FAQ ?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/faqs/${id}`);
      setMessage({ 
        text: "FAQ supprimée", 
        variant: "success" 
      });
      // Si on supprime l'élément en cours d'édition, on reset le formulaire
      if (editingId === id) {
        setQuestion("");
        setAnswer("");
        setEditingId(null);
      }
      await fetchFaqs();
    } catch (err) {
      console.error("Delete FAQ error:", err);
      setMessage({ 
        text: err.response?.data?.message || "Erreur de suppression", 
        variant: "error" 
      });
    }
  };

  const handleCancelEdit = () => {
    setQuestion("");
    setAnswer("");
    setEditingId(null);
  };

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", variant: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-black p-6 border-[#64FF07] border-2 rounded-lg shadow-lg">
        <h2 className="special-font text-4xl text-center mb-6 text-black dark:text-gray-100">
          <b>Gérer les FAQs</b>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm text-black dark:text-gray-100 mb-1">
              Question
            </label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-2 rounded-lg border dark:bg-gray-800 dark:text-white"
              placeholder="Saisir une question fréquente..."
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="answer" className="block text-sm text-black dark:text-gray-100 mb-1">
              Réponse
            </label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              className="w-full p-2 rounded-lg border dark:bg-gray-800 dark:text-white"
              placeholder="Saisir la réponse associée..."
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              title={isLoading ? "En cours..." : editingId ? "Mettre à jour" : "Ajouter la FAQ"}
              leftIcon={<TiLocationArrow />}
              containerClass="flex-center gap-1"
              className="text-white bg-black"
              disabled={isLoading}
            />
            {editingId && (
              <Button
                type="button"
                title="Annuler"
                onClick={handleCancelEdit}
                className="text-white bg-gray-500"
                disabled={isLoading}
              />
            )}
          </div>
        </form>

        {message.text && (
          <div
            className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
              message.variant === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100"
                : "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100"
            }`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
            {faqs.length > 0 ? "Toutes les FAQs :" : "Aucune FAQ disponible"}
          </h3>
          
          {isLoading && faqs.length === 0 ? (
            <p>Chargement...</p>
          ) : (
            faqs.map((faq) => (
              <div
                key={faq._id}
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-3 shadow-sm"
              >
                <p className="text-black dark:text-white">
                  <b>Q:</b> {faq.question}
                </p>
                <p className="text-gray-800 dark:text-gray-300">
                  <b>R:</b> {faq.answer}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => handleEdit(faq)}
                    title="Modifier"
                    leftIcon={<FiEdit />}
                    containerClass="flex-center gap-2"
                    className="text-white bg-blue-600"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={() => handleDelete(faq._id)}
                    title="Supprimer"
                    leftIcon={<FiTrash2 />}
                    containerClass="flex-center gap-2"
                    className="text-white bg-red-600"
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqManager;