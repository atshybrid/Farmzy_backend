
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import admin from 'firebase-admin';

dotenv.config();
const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin if service account provided via env
if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Replace escaped newlines with actual newlines
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
  console.log('Firebase admin initialized');
}

// Simple auth middleware: verify Firebase ID token
async function authMiddleware(req:any, res:any, next:any) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
    if (!token) return res.status(401).json({ error: 'Missing token' });
    if (!admin.apps.length) return res.status(500).json({ error: 'Firebase admin not initialized' });
    const decoded = await admin.auth().verifyIdToken(token);
    (req as any).uid = decoded.uid;
    next();
  } catch (err:any) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Products
app.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({ where: { isActive: true } });
  res.json(products);
});

// Orders
app.post('/orders', authMiddleware, async (req, res) => {
  try {
    const uid = (req as any).uid;
    const { items, address, amount } = req.body;
    // Ensure user exists or create minimal user record with phone from Firebase token
    const userRecord = await admin.auth().getUser(uid);
    const phone = userRecord.phoneNumber || uid;
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({ data: { phone, name: userRecord.displayName || null } });
    }
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        status: 'created',
        amount: amount || 0,
        address,
        items: {
          create: items.map((it:any) => ({
            productId: it.productId,
            qty: it.qty,
            price: it.price
          }))
        }
      },
      include: { items: true }
    });
    res.json(order);
  } catch (err:any) {
    console.error(err);
    res.status(500).json({ error: 'failed to create order' });
  }
});

// Get order
app.get('/orders/:id', authMiddleware, async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: { items: true } });
  if (!order) return res.status(404).json({ error: 'not found' });
  res.json(order);
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log('Server running on port', port));
