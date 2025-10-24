import Message from '../models/Message.js';
import Context from '../models/Context.js';

export const getHistory = async (req, res) => {
  try {
    const { contextId } = req.params;
    // Ensure requester is a member
    const context = await Context.findById(contextId);
    if (!context) return res.status(404).json({ message: 'Context not found' });
    if (!context.members.map(String).includes(req.user.id))
      return res.status(403).json({ message: 'Not authorized' });

    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const messages = await Message.find({ contextId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('senderId', 'username email')
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    console.error('getHistory error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { contextId, content } = req.body;
    if (!contextId || !content) return res.status(400).json({ message: 'contextId and content are required' });

    const context = await Context.findById(contextId);
    if (!context) return res.status(404).json({ message: 'Context not found' });
    if (!context.members.map(String).includes(req.user.id))
      return res.status(403).json({ message: 'Not authorized' });

    const message = await Message.create({ contextId, senderId: req.user.id, content, timestamp: new Date() });

    // Optionally, if Socket.IO instance is attached to app
    try {
      const io = req.app.get('io');
      if (io) io.to(`context_${contextId}`).emit('receive_message', message);
    } catch (e) {}

    res.status(201).json(message);
  } catch (err) {
    console.error('sendMessage error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
