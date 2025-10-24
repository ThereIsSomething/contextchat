import mongoose from 'mongoose';

const contextSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

contextSchema.index({ name: 1, createdBy: 1 });

const Context = mongoose.model('Context', contextSchema);
export default Context;
