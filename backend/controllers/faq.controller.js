
import FAQService from '../services/faq.service.js'; // Chemin correct vers votre service

export const createFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    const newFAQ = await FAQService.createFAQ(question, answer);
    res.status(201).json(newFAQ);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
  };
  
  export const getAllFAQs = async (req, res) => {
    try {
      const faqs = await FAQService.getAllFAQs();
      res.status(200).json(faqs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  


export const deleteFAQ = async (req, res, next) => {
    try {
      await FAQService.deleteFAQ(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

export const updateFAQ = async (req, res, next) => {
  try {
    const updated = await FAQService.updateFAQ(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
