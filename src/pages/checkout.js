const express = require('express');
const { z } = require('zod');
const pool = require('../db'); // Assuming you have a db connection pool module
const { authenticate } = require('../middleware/auth'); // Assuming you have auth middleware

const router = express.Router();

// Zod schema for validation
const OrderSchema = z.object({
  shippingDetails: z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    addressLine1: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }),
  cartItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
    qty: z.number().int().positive(),
  })).min(1),
  totalAmount: z.number().positive(),
  paymentMethod: z.string(),
});

router.post('/', authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const validation = OrderSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid order data', errors: validation.error.errors });
    }

    const { shippingDetails, cartItems, totalAmount, paymentMethod } = validation.data;
    const userId = req.user?.id || null; // Get user ID from auth middleware, can be null

    // Split fullName into first and last name for the DB
    const nameParts = shippingDetails.fullName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    await client.query('BEGIN');

    // Insert into purchases table
    const purchaseRes = await client.query(
      `INSERT INTO purchases (user_id, first_name, last_name, phone, email, shipping_street, shipping_city, shipping_state, shipping_postal_code, shipping_country, total_amount, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [userId, firstName, lastName, shippingDetails.phone, shippingDetails.email, shippingDetails.addressLine1, shippingDetails.city, shippingDetails.state, shippingDetails.zipCode, shippingDetails.country, totalAmount, paymentMethod]
    );
    const purchaseId = purchaseRes.rows[0].id;

    // Insert into purchase_items table
    const itemInsertPromises = cartItems.map(item => {
      return client.query(
        `INSERT INTO purchase_items (purchase_id, product_id, product_name, quantity, price_per_unit)
         VALUES ($1, $2, $3, $4, $5)`,
        [purchaseId, item.id, item.name, item.qty, item.price]
      );
    });

    await Promise.all(itemInsertPromises);

    await client.query('COMMIT');

    res.status(201).json({ message: 'Order placed successfully', purchaseId });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Failed to place order' });
  } finally {
    client.release();
  }
});

module.exports = router;