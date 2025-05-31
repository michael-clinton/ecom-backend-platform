const User = require('../models/User'); // adjust path to your User model

async function getUserById(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('username email phone'); // select only fields you want to expose

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { getUserById };
