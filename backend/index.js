require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin: FRONTEND_URL }));

app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/escalate', require('./routes/escalate'));
app.use('/api/auth', require('./routes/auth'));

app.get('/ping', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
