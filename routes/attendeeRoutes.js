const express = require("express");
const auth = require("../middleware/auth");
const {
  rsvp,
  cancelRsvp,
  getAttendees,
} = require("../controllers/attendeeController");
const router = express.Router();

router.post("/:eventId/rsvp", auth, rsvp);
router.delete("/:eventId/rsvp", auth, cancelRsvp);
router.get("/:eventId/attendees", auth, getAttendees);

module.exports = router;
