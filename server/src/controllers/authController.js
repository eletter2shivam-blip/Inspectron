const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { generateToken } = require('../middleware/auth');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email and password are required.' });
    }

    const user = db.findOne('users', { email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'qa_engineer', title = 'QA Engineer' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Name, email, and password are required.' });
    }

    const existing = db.findOne('users', { email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = db.insert('users', {
      name,
      email: email.toLowerCase().trim(),
      password: passwordHash,
      role,
      title
    });

    const token = generateToken(newUser);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        title: newUser.title
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};
