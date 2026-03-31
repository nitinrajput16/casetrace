const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { complaintId, reason } = req.body;
  if (!complaintId) return res.status(400).json({ error: 'complaintId required' });

  try {
    const complaint = await prisma.complaint.findUnique({ where: { complaintId } });
    if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

    const esc = await prisma.escalationAlert.create({
      data: { complaintId: complaint.id, reason: reason || 'Escalation requested', notifiedTo: 'SP' }
    });

    const html = `<html><body><h1>Escalation: ${complaint.complaintId}</h1><p>To SP/DCP</p><p>Reason: ${reason || ''}</p></body></html>`;

    if (process.env.DISABLE_PDF === 'true') {
      return res.json({ ok: true, escalation: esc });
    }

    try {
      const generatePdf = require('../utils/generatePdf');
      const pdf = await generatePdf(html);
      res.setHeader('Content-Type', 'application/pdf');
      return res.send(pdf);
    } catch (err) {
      console.error('PDF generation failed', err);
      return res.json({ ok: true, escalation: esc, pdfGenerated: false });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
