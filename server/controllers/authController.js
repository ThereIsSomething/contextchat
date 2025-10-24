import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) =>
  jwt.sign({ id: user._id, email: user.email, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ username, email, password });
    const token = signToken(user);
    return res.status(201).json({
      user: { id: user._id, username: user.username, email: user.email },
      token
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({ user: { id: user._id, username: user.username, email: user.email }, token });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
