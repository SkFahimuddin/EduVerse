require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// Schemas
const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});

const assignmentSchema = new mongoose.Schema({
  title: String,
  subject: String,
  deadline: String,
  description: String,
  postedBy: String,
  postedAt: { type: Date, default: Date.now }
});

const noteSchema = new mongoose.Schema({
  title: String,
  subject: String,
  description: String,
  uploadedBy: String,
  uploadedAt: { type: Date, default: Date.now }
});

const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  postedBy: String,
  postedAt: { type: Date, default: Date.now }
});

// Models
const Message = mongoose.model('Message', messageSchema);
const Assignment = mongoose.model('Assignment', assignmentSchema);
const Note = mongoose.model('Note', noteSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);

// Routes
app.get('/', (req, res) => res.json({ status: 'ok', message: 'MongoDB Backend Running' }));

// Messages
app.get('/api/messages', async (req, res) => {
  try {
    const data = await Message.find().sort({ timestamp: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const msg = new Message(req.body);
    await msg.save();
    res.status(201).json(msg);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assignments
app.get('/api/assignments', async (req, res) => {
  try {
    const data = await Assignment.find().sort({ postedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const item = new Assignment(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/assignments/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Notes
app.get('/api/notes', async (req, res) => {
  try {
    const data = await Note.find().sort({ uploadedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const item = new Note(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const data = await Announcement.find().sort({ postedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const item = new Announcement(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));