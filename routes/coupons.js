const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');

// GET /api/coupons/:code
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return res.status(404).json({ message: 'Cupón no válido o inactivo' });
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(410).json({ message: 'El cupón ha expirado' });
    }

    res.status(200).json({
      code: coupon.code,
      discount: coupon.discount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error al validar el cupón', error: err.message });
  }
});

module.exports = router;
