const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/complaints - list complaints (lightweight)
router.get('/', async (req, res) => {
  try {
    const items = await prisma.complaint.findMany({ select: { complaintId: true, title: true, status: true } , orderBy: { filedAt: 'desc' } });
    res.json(items);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { complaintId: id },
      include: { updates: { orderBy: { createdAt: 'asc' } }, escalations: true }
    });
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    res.json(complaint);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id/updates', async (req, res) => {
  const id = req.params.id;
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { complaintId: id },
      include: { updates: { orderBy: { createdAt: 'asc' } } }
    });
    if (!complaint) return res.status(404).json({ error: 'Not found' });
    res.json(complaint.updates);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
