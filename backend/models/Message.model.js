// models/Message.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },


  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  statusSend: {
    type: Boolean,
    default: false
  },
});

messageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


const Message = mongoose.model('Message', messageSchema, 'messages');

export default Message;