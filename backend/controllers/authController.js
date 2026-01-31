const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// REGISTER - MANUAL HASH
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // ✅ MANUAL HASH BEFORE SAVE
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await User.create({
      email,
      password: hashedPassword,  // Already hashed!
      name
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ COMPARE HASHED PASSWORD
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('🔑 Password match:', isMatch); // DEBUG

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        subscription: user.subscription 
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, user });
};
