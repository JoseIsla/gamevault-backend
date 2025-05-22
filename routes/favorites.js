const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

// GET favoritos del usuario
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate('favorites');
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// POST añadir a favoritos
router.post('/add', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, {
      $addToSet: { favorites: productId }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al añadir a favoritos' });
  }
});

// DELETE eliminar de favoritos
router.post('/remove', async (req, res) => {
  const { userId, productId } = req.body;
  try {
    await User.findByIdAndUpdate(userId, {
      $pull: { favorites: productId }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al quitar de favoritos' });
  }
});

module.exports = router;
