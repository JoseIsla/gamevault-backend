const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const app = express();

// Middleware


app.use(cors({
  origin: ['https://gamevault-frontend-nu.vercel.app', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const sliderRoutes = require('./routes/sliderRoutes');
const couponRoutes = require('./routes/coupons');
const orderRoutes = require('./routes/orders');
const favoriteRoutes = require('./routes/favorites');







// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/slider', sliderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);

// Rutas estáticas (por si subes imágenes o recursos)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('GameVault API conectada correctamente');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {

})
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch(err => {
    console.error("❌ Error de conexión a MongoDB:", err.message);
    process.exit(1);
  });

  app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando correctamente 🚀' });
});


// Lanzar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});


