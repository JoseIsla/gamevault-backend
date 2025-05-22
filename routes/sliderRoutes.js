const express = require('express');
const router = express.Router();
const Slider = require('../models/Slider');

// Ruta GET para obtener todos los sliders


router.get('/', async (req, res) => {
    
  
    try {
      const sliders = await Slider.find();

  
      res.status(200).json(sliders);
    } catch (err) {
      console.error("❌ Error al obtener sliders:", err.message);
      res.status(500).json({ message: 'Error al obtener los sliders', error: err.message });
    }
  });
  

module.exports = router;


