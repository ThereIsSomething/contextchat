import Context from '../models/Context.js';
import User from '../models/User.js';

export const createContext = async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const context = await Context.create({
      name,
      description: description || '',
      isPrivate: !!isPrivate,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    res.status(201).json(context);
  } catch (err) {
    console.error('createContext error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMyContexts = async (req, res) => {
  try {
    const contexts = await Context.find({ members: req.user.id }).populate('members', 'username email');
    res.json(contexts);
  } catch (err) {
    console.error('getMyContexts error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params; // context id
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const context = await Context.findById(id);
    if (!context) return res.status(404).json({ message: 'Context not found' });

    // Only members can add others (simplified)
    if (!context.members.map(String).includes(req.user.id))
      return res.status(403).json({ message: 'Not authorized' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!context.members.map(String).includes(user._id.toString())) {
      context.members.push(user._id);
      await context.save();
    }

    res.json({ message: 'Member added', context });
  } catch (err) {
    console.error('addMember error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const leaveContext = async (req, res) => {
  try {
    const { id, userId } = req.params; // context id and user id to remove
    const context = await Context.findById(id);
    if (!context) return res.status(404).json({ message: 'Context not found' });

    // Allow self-leave or creator to remove others
    if (req.user.id !== userId && context.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    context.members = context.members.filter((m) => m.toString() !== userId);
    await context.save();
    res.json({ message: 'Member removed', context });
  } catch (err) {
    console.error('leaveContext error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
