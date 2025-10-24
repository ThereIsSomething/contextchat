import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Context',
      index: true,
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 5000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    }
  },
  { versionKey: false }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
