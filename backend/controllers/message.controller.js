// controllers/message.controller.js
import {
  createMessageService,
  getAllMessagesService,
  getMessageByIdService,
  deleteMessageService,
  updateMessageService,
} from '../services/message.service.js';

// Create a new message
export const createMessage = async (req, res) => {
  try {
    const { title, content } = req.body;
    const message = await createMessageService({ title, content });
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all messages
export const getAllMessages = async (req, res) => {
  try {
    const messages = await getAllMessagesService();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get message by ID
export const getMessageById = async (req, res) => {
  try {
    const message = await getMessageByIdService(req.params.id);
    res.json(message);
  } catch (error) {
    res.status(error.message === 'Message not found' ? 404 : 500)
       .json({ message: error.message });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    await deleteMessageService(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(error.message === 'Message not found' ? 404 : 500)
       .json({ message: error.message });
  }
};

// Update a message
export const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    
    const updatedMessage = await updateMessageService(id, { title, content });
    res.json(updatedMessage);
  } catch (error) {
    res.status(error.message === 'Message not found' ? 404 : 400)
       .json({ message: error.message });
  }
};

