const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const Order = require('../models/Order');
require('dotenv').config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


// ✅ Conversión manual: tasas aproximadas (actualiza si cambian)
const RATES = {
  eur: 1,
  usd: 1.1,
  gbp: 0.85
};



function convert(amount, from, to) {
  if (!RATES[from] || !RATES[to]) {
    console.warn(`⚠️ Moneda no soportada: ${from} -> ${to}. Usando EUR por defecto.`);
    return amount;
  }
  const eurAmount = amount / RATES[from];
  const converted = eurAmount * RATES[to];
  return parseFloat(converted.toFixed(2));
}

function generateKey() {
  return 'XXXX-XXXX-XXXX-XXXX'.replace(/[X]/g, () =>
    Math.floor(Math.random() * 36).toString(36).toUpperCase()
  );
}

router.get('/session/:id', async (req, res) => {
  try {
    const order = await Order.findOne({ stripeSessionId: req.params.id });
    if (!order) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar el pedido' });
  }
});
router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: 'Error al buscar pedidos' });
  }
});



router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, coupon, subtotal, discount, total, currency, userId } = req.body;
    const finalCurrency = currency?.toLowerCase() || 'eur';

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No hay productos en la orden.' });
    }

    // Convertimos manualmente los precios por producto
    const convertedItems = items.map(item => {
      const convertedPrice = convert(item.price, 'eur', finalCurrency);
      return {
        ...item,
        price: convertedPrice
      };
    });

    const line_items = convertedItems.map(item => ({
      price_data: {
        currency: finalCurrency,
        product_data: {
          name: item.title,
          images: [item.image],
          metadata: {
            platform: item.platform,
          },
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    console.log('🧾 Items a Stripe:', line_items);

    // Crear sesión
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    const itemsWithKeys = items.flatMap(item => {
      return Array.from({ length: item.quantity }).map(() => ({
        title: item.title,
        image: item.image,
        platform: item.platform,
        quantity: 1,
        price: item.price,
        key: generateKey()
      }));
    });

    // Guardar orden
    const order = new Order({
      items: itemsWithKeys,
      userId,
      coupon,
      subtotal,
      discount,
      total,
      currency: finalCurrency,
      stripeSessionId: session.id,
      status: 'pending',
      createdAt: new Date(),
    });

    await order.save();

    res.status(200).json({ id: session.id });
  } catch (err) {
    console.error('❌ Error creando sesión de Stripe:', err.message);
    res.status(500).json({ error: 'Error al crear la sesión de pago' });
  }
});

module.exports = router;
