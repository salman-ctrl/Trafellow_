const Event = require('../models/Event');
const EventParticipant = require('../models/EventParticipant');
const { createSlug } = require('../utils/slugify');
const { validationResult } = require('express-validator');

exports.getAllEvents = async (req, res) => {
  try {
    const { region_id, status, upcoming, page = 1, limit = 10 } = req.query;

    const filters = {
      region_id,
      status,
      upcoming: upcoming === 'true',
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const events = await Event.getAll(filters);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan'
      });
    }

    const participants = await EventParticipant.getByEventId(id);

    res.json({
      success: true,
      data: {
        ...event,
        participants
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const eventData = {
      ...req.body,
      slug: createSlug(req.body.title),
      created_by: req.user.user_id
    };

    if (req.file) {
      eventData.image = `/uploads/events/${req.file.filename}`;
    }

    const eventId = await Event.create(eventData);

    await EventParticipant.create({
      event_id: eventId,
      user_id: req.user.user_id,
      status: 'confirmed'
    });
    await Event.incrementParticipants(eventId);

    res.status(201).json({
      success: true,
      message: 'Event berhasil dibuat',
      data: { event_id: eventId }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan'
      });
    }

    if (event.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Event sudah tidak menerima peserta'
      });
    }

    if (event.current_participants >= event.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Kuota peserta sudah penuh'
      });
    }

    const alreadyJoined = await EventParticipant.findByEventAndUser(id, userId);
    if (alreadyJoined) {
      return res.status(400).json({
        success: false,
        message: 'Anda sudah terdaftar di event ini'
      });
    }

    await EventParticipant.create({ event_id: id, user_id: userId });
    await Event.incrementParticipants(id);

    if (event.current_participants + 1 >= event.max_participants) {
      await Event.updateStatus(id, 'full');
    }

    res.json({
      success: true,
      message: 'Berhasil bergabung ke event'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan'
      });
    }

    if (event.created_by === userId) {
      return res.status(400).json({
        success: false,
        message: 'Creator tidak bisa keluar dari event'
      });
    }

    const participant = await EventParticipant.findByEventAndUser(id, userId);
    if (!participant) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak terdaftar di event ini'
      });
    }

    await EventParticipant.updateStatus(id, userId, 'cancelled');
    await Event.decrementParticipants(id);

    if (event.status === 'full') {
      await Event.updateStatus(id, 'open');
    }

    res.json({
      success: true,
      message: 'Berhasil keluar dari event'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan'
      });
    }

    if (event.created_by !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      updateData.image = `/uploads/events/${req.file.filename}`;
    }

    await Event.update(id, updateData);

    res.json({
      success: true,
      message: 'Event berhasil diupdate'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event tidak ditemukan'
      });
    }

    if (event.created_by !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses'
      });
    }

    await Event.delete(id);

    res.json({
      success: true,
      message: 'Event berhasil dihapus'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const events = await EventParticipant.getByUserId(userId);
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
