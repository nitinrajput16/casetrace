const express = require('express');
const router = express.Router();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { message, complaintId } = req.body;
  try {
    let context = '';
    if (complaintId) {
      const comp = await prisma.complaint.findUnique({ where: { complaintId }, include: { updates: { orderBy: { createdAt: 'asc' } } } });
      if (comp) {
        context = `Complaint ${comp.complaintId}: ${comp.title}. Status: ${comp.status}. Last update: ${comp.lastUpdateAt}\n`;
        if (comp.updates && comp.updates.length) {
          context += 'Recent updates:\n' + comp.updates.map(u => `- ${new Date(u.createdAt).toLocaleDateString()}: ${u.updateText}`).join('\n');
        }
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return a mock reply when API key is not configured (useful for local dev)
      return res.json({ reply: `Mock reply: received "${message}" (no GEMINI_API_KEY configured)`, provider: 'mock' });
    }

    const prompt = `${context}\nUser: ${message}\nAssistant:`;
    const endpoint = process.env.GEMINI_ENDPOINT || 'https://generative.googleapis.com/v1beta2/models/gemini-2.0-flash:generate';
    const apiKey = process.env.GEMINI_API_KEY;

    const r = await axios.post(endpoint, { prompt, maxOutputTokens: 512 }, { headers: { Authorization: `Bearer ${apiKey}` } });
    res.json({ reply: r.data, provider: 'gemini' });
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).json({ error: 'AI proxy error' });
  }
});

module.exports = router;
