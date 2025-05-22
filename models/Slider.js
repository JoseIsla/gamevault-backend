const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
  title: String,
  image: String,
  link: String,
  order: Number
});

module.exports = mongoose.model('Slider', sliderSchema, 'slider');


