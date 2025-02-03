const express = require("express");
const eventController = require("../controllers/eventController");
const auth = require("../middleware/auth");
const userRole = require("../middleware/userRole");

const router = express.Router();

router.post("/", auth, userRole("Admin"), eventController.createEvent);
router.get("/", eventController.getEvents);

module.exports = router;
