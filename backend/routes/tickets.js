const express = require('express');
const router = express.Router();
const { Ticket, Notification } = require('../models/Other');
const { auth, adminAuth } = require('../middleware/auth');

// Create ticket
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message, priority, relatedOrder } = req.body;
    const ticket = new Ticket({
      user: req.user._id,
      subject,
      priority: priority || 'medium',
      relatedOrder,
      messages: [{ sender: req.user._id, senderRole: 'user', message }],
    });
    await ticket.save();
    res.status(201).json({ success: true, message: 'تم فتح التذكرة بنجاح', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Get user tickets
router.get('/', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Reply to ticket
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ success: false, message: 'التذكرة غير موجودة' });

    ticket.messages.push({ sender: req.user._id, senderRole: 'user', message: req.body.message });
    ticket.status = 'pending';
    await ticket.save();

    res.json({ success: true, message: 'تم إرسال ردك بنجاح', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Admin: Get all tickets
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    const tickets = await Ticket.find(query)
      .populate('user', 'username email')
      .sort({ createdAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// Admin: Reply to ticket
router.post('/admin/:id/reply', adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'التذكرة غير موجودة' });

    ticket.messages.push({ sender: req.user._id, senderRole: 'admin', message: req.body.message });
    ticket.status = 'answered';
    await ticket.save();

    await Notification.create({
      user: ticket.user,
      title: 'رد على تذكرتك',
      message: `تم الرد على تذكرتك: ${ticket.subject}`,
      type: 'ticket',
      link: `/support/${ticket._id}`,
    });

    res.json({ success: true, message: 'تم الرد بنجاح', ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

module.exports = router;
