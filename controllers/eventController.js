const Event = require("../models/Event");

exports.createEvent = async (req, res) => {
  const { name, description, date, location } = req.body;
  try {
    const event = new Event({ name, description, date, location });
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getEvents = async (req, res) => {
  const { location, date } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const filter = {};
  if (location) filter.location = location;
  if (date) filter.date = { $gte: new Date(date) };

  try {
    const [events, total] = await Promise.all([
      Event.find(filter).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    res.json({
      events,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
