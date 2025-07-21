import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    language: String,
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative']
    }
  }
});

export default mongoose.model('Chat', ChatSchema);