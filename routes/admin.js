const express = require("express");
const router = express.Router();
const User = require("../models/User");

const { ensureAuthenticated, checkRole } = require("../middleware/auth");

// Display all Reports sorted by date (newest first)
router.get("/", ensureAuthenticated, checkRole(["admin"]), async (req, res) => {
  const users = await User.find();
  res.render("display-profiles", { users });
});

router.post(
  "/delete/:id",
  ensureAuthenticated,
  checkRole(["admin"]),
  async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    res.redirect("display-profiles");
  }
);

router.get(
  "/update-profile/:id",
  ensureAuthenticated,
  checkRole(["admin"]),
  async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render("update-profile", { user });
  }
);

router.post(
  "/update-profile",
  ensureAuthenticated,
  checkRole(["admin"]),
  async (req, res) => {
    const { id, name, contactPerson, location, regNo } = req.body;
    const user = await User.findById(id);
    if (name) {
      user.name = name;
    }
    if (regNo) {
      user.regNo = regNo;
    }
    if (location) {
      user.location = location;
    }
    if (contactPerson) {
      user.contactPerson = contactPerson;
    }
    await user.save();
    res.redirect("display-profiles");
  }
);

module.exports = router;
