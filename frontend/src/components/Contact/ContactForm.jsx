import { useState } from "react";
import { sendContactMessage } from "../../services/contactApi";
import Button from "../common/Button";
import { FiSend ,FiArrowLeft} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "", type: "" });

    try {
      await sendContactMessage(formData);
      setStatus({ message: "Message envoyé avec succès !", type: "success" });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ message: err.message, type: "error" });
    }
  };
  const handleBack = () => {
    navigate('/');
  };
  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-6">
      <div className="relative">
        <input
          type="text"
          name="name"
          placeholder="Votre nom"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full border-b-2 border-blue-50/30 bg-transparent px-1 py-3 text-blue-50 transition-all placeholder:text-blue-50/50 focus:border-blue-50 focus:outline-none"
        />
      </div>

      <div className="relative">
        <input
          type="email"
          name="email"
          placeholder="Votre email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full border-b-2 border-blue-50/30 bg-transparent px-1 py-3 text-blue-50 transition-all placeholder:text-blue-50/50 focus:border-blue-50 focus:outline-none"
        />
      </div>

      <div className="relative">
        <textarea
          name="message"
          placeholder="Votre message"
          value={formData.message}
          onChange={handleChange}
          required
          rows="5"
          className="w-full resize-none border-b-2 border-blue-50/30 bg-transparent px-1 py-3 text-blue-50 transition-all placeholder:text-blue-50/50 focus:border-blue-50 focus:outline-none"
        />
      </div>

      <div className=" flex items-center justify-between pt-4">
        <Button
          onClick={handleBack}
          title="Retour"
          leftIcon={<FiArrowLeft />}
          containerClass="flex-center gap-2 m-1 p-10"
          className="m-10 bg-black p-10 text-white"
        >
        </Button>
        <Button
          onClick={handleSubmit}
          title={"Envoyer "}
          leftIcon={<FiSend />}
          containerClass="flex-center gap-2 m-1 p-10"
          className="m-10 bg-black p-10 text-white"
        >
        </Button>


      </div>

      {status.message && (
        <p className={`mt-4 text-center text-sm ${status.type === "success" ? "text-green-400" : "text-red-400"}`}>
          {status.message}
        </p>
      )}
    </form>
  );
};

export default ContactForm;