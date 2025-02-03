const Attendee = require("../models/Attendee");
const Event = require("../models/Event");

// RSVP for an event
exports.rsvp = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  try {
    // Check if the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user has already RSVP'd
    const existingAttendee = await Attendee.findOne({
      user: userId,
      event: eventId,
    });

    if (existingAttendee) {
      return res
        .status(400)
        .json({ message: "You have already RSVP'd for this event" });
    }

    // Create attendee record and update event's attendees list
    const [attendee] = await Promise.all([
      Attendee.create({
        user: userId,
        event: eventId,
        rsvp: true,
      }),
      Event.findByIdAndUpdate(eventId, {
        $addToSet: { attendees: userId },
      }),
    ]);

    res.status(201).json(attendee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel RSVP
exports.cancelRsvp = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user._id;

  try {
    // Remove attendee record and update event's attendees list
    const [attendee] = await Promise.all([
      Attendee.findOneAndDelete({ user: userId, event: eventId }),
      Event.findByIdAndUpdate(eventId, {
        $pull: { attendees: userId },
      }),
    ]);

    if (!attendee) {
      return res.status(404).json({ message: "RSVP not found" });
    }

    res.status(200).json({ message: "RSVP cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get attendees for an event
exports.getAttendees = async (req, res) => {
  const { eventId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const [attendees, total] = await Promise.all([
      Attendee.find({ event: eventId })
        .populate("user", "name email")
        .skip(skip)
        .limit(limit),
      Attendee.countDocuments({ event: eventId }),
    ]);

    res.status(200).json({
      attendees,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
