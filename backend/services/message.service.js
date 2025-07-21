// services/message.service.js
import Message from "../models/Message.model.js";

// Create a new message
export const createMessageService = async (messageData) => {
  const message = new Message(messageData);
  await message.save();
  return message;
};

// Get all messages
export const getAllMessagesService = async () => {
  return await Message.find().sort({ createdAt: -1 });
};

// Get message by ID
export const getMessageByIdService = async (id) => {
  const message = await Message.findById(id);
  if (!message) {
    throw new Error('Message not found');
  }
  return message;
};

// Delete a message
export const deleteMessageService = async (id) => {
  const message = await Message.findByIdAndDelete(id);
  if (!message) {
    throw new Error('Message not found');
  }
  return message;
};

// Update a message
export const updateMessageService = async (id, updateData) => {
  const updatedMessage = await Message.findByIdAndUpdate(
    id,
    { 
      ...updateData,
      updatedAt: Date.now() 
    },
    { new: true, runValidators: true }
  );
  
  if (!updatedMessage) {
    throw new Error('Message not found');
  }
  return updatedMessage;
};

