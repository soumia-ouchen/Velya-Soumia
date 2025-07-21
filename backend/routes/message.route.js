// routes/messageRoutes.js
import express from "express"; 
import {
    getAllMessages, createMessage,
     deleteMessage,updateMessage,getMessageById
} from '../controllers/message.controller.js';



const router = express.Router();
// Create a new message
router.post('/', createMessage);

// Get all messages
router.get('/', getAllMessages);
router.get('/:id', getMessageById);

// Delete a message
router.delete('/:id', deleteMessage);


router.put('/:id', updateMessage);


export default router;
