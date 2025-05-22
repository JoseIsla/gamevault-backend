const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');

const PLATFORMS = ['PC', 'PSN', 'Xbox', 'Nintendo'];

router.get('/', async (req, res) => {
  try {
    const { categoria, search, upcoming, popular, discount } = req.query;
    const query = {};

    // Buscar por texto libre
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Compatibilidad directa (para landing pages u otras rutas que NO usan categoria)
    if (upcoming === 'true') query.isUpcoming = true;
    if (popular === 'true') query.isPopular = true;
    if (discount === 'true') query.discount = { $gt: 0 };

    // Si viene categoria (modo navegación principal)
    if (categoria && !upcoming && !popular && !discount) {
      if (PLATFORMS.includes(categoria)) {
        query.platform = categoria;
      } else {
        switch (categoria) {
          case 'Promociones':
            query.discount = { $gt: 0 };
            break;

          case 'Ofertas Diarias': {
            query.discount = { $gt: 0 };
            const randomPromo = await Product.aggregate([
              { $match: query },
              { $sample: { size: 10 } }
            ]);
            return res.status(200).json(randomPromo);
          }

          case 'Novedades':
            query.isPopular = true;
            break;

          case 'Próximamente':
            query.isUpcoming = true;
            break;

          case 'Prepago':
            query.title = { $regex: 'gift|points|wallet|prepago|card', $options: 'i' };
            break;

          default:
            query.tags = { $in: [categoria] };
            break;
        }
      }
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (err) {
    console.error('Error al obtener productos:', err.message);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID de producto no válido' });
  }

  try {
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener producto', error: err.message });
  }
});

module.exports = router;

