// server.js (ESM)
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// __dirname replacement for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static files
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not set. Copy .env.example to .env and set it.');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('MongoDB connect error:', err.message));
}

// schema + model
const snippetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  language: { type: String },
  tags: [String],
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Snippet = mongoose.model('Snippet', snippetSchema);

// CRUD routes
app.get('/api/snippets', async (req, res) => {
  try {
    const list = await Snippet.find().sort({ createdAt: -1 }).limit(200);
    res.json(list);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/snippets', async (req, res) => {
  try {
    const { title, language, tags, content } = req.body;
    const tagsArr = (tags || '').split(',').map(s => s.trim()).filter(Boolean);
    const sn = new Snippet({ title, language, tags: tagsArr, content });
    await sn.save();
    res.json(sn);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.put('/api/snippets/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { title, language, tags, content } = req.body;
    const tagsArr = (tags || '').split(',').map(s => s.trim()).filter(Boolean);
    const updated = await Snippet.findByIdAndUpdate(
      id,
      { title, language, tags: tagsArr, content },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Snippet not found' });
    res.json(updated);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

app.delete('/api/snippets/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Snippet.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Snippet not found' });
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// add near top after routes are defined (just before fallback)
app.get('/health', async (req, res) => {
  const dbState = mongoose.connection.readyState; // 0 = disconnected, 1 = connected
  res.json({ status: 'ok', dbState });
});



// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port', PORT));
