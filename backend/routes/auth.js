const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.credential.cert(svc) });
  } catch (e) {
    console.warn('Failed to init firebase-admin:', e.message);
  }
}

router.post('/verify', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ error: 'idToken required' });
  try {
    if (!admin.apps.length) {
      // No firebase-admin configured: return a mock user for local dev
      const phone = '+911234567890';
      let user = await prisma.user.findUnique({ where: { phone } });
      if (!user) user = await prisma.user.create({ data: { phone, name: 'Local User' } });
      return res.json({ token: 'MOCK_JWT', user });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const phone = decoded.phone_number || decoded.phone;
    if (!phone) return res.status(400).json({ error: 'No phone number in token' });

    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) user = await prisma.user.create({ data: { phone, name: decoded.name || null } });
    res.json({ token: 'LOCAL_JWT', user });
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
