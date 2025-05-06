const express = require("express");
const router = express.Router();
const Tip = require("../models/Tip"); // Import Tip model
const User = require("../models/User"); // Assuming user model exists
//const { isAuthenticated } = require("../middleware/auth"); // Middleware to check login
const { ensureAuthenticated, checkRole } = require("../middleware/auth");

// Add new tip
router.post(
  "/add",
  ensureAuthenticated,
  checkRole(["advisor", "admin"]),
  async (req, res) => {
    try {
      const newTip = new Tip({
        title: req.body.title,
        content: req.body.content,
        postedBy: req.user._id, // Assuming req.user exists after authentication
      });
      await newTip.save();
      req.flash("success_msg", "Tip added successfully");
      res.redirect("/tips");
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Error addng tips");
      res.status(500);
      // .send("Error adding tip");
    }
  }
);

// Display all tips sorted by date (newest first)
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const tips = await Tip.find()
      .populate("postedBy", "name")
      .sort({ createdOn: -1 });
    res.render("tips", { tips });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error fetching tips");
    res.status(500);
    // .send("Error fetching tips");
  }
});

// Upvote a tip
router.post("/:id/upvote", ensureAuthenticated, async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip.upVotes.includes(req.user._id)) {
      tip.upVotes.push(req.user._id);
      tip.downVotes = tip.downVotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    }
    await tip.save();
    res.redirect("/tips");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error upvoting");
    res.status(500);
    // .send("Error upvoting");
  }
});

// Downvote a tip
router.post("/:id/downvote", ensureAuthenticated, async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip.downVotes.includes(req.user._id)) {
      tip.downVotes.push(req.user._id);
      tip.upVotes = tip.upVotes.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    }
    await tip.save();
    res.redirect("/tips");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error downvoting");
    res.status(500);
    // .send("Error downvoting");
  }
});

// Delete a tip
router.post(
  "/:id/delete",
  ensureAuthenticated,
  checkRole(["advisor", "admin"]),
  async (req, res) => {
    try {
      await Tip.findByIdAndDelete(req.params.id);
      req.flash("success_msg", "Tip deleted successfully");
      res.redirect("/tips");
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Error deleting tip");
      res.status(500).send("Error deleting tip");
    }
  }
);

router.post(
  "/:id/verify",
  ensureAuthenticated,
  checkRole(["advisor", "admin"]),
  async (req, res) => {
    try {
      const report = await Report.findById(req.params.id);

      if (!report) {
        req.flash("error_msg", "Report not found.");
        return res.redirect("/reports");
      }

      // Update status to Verified
      report.status = "Verified";

      // Add the logged-in user's ID to the verifiedBy array (if not already present)
      if (!report.verifiedBy.includes(req.user._id)) {
        report.verifiedBy.push(req.user._id);
      }

      await report.save();

      req.flash("success_msg", "Report verified successfully.");
      res.redirect("/reports");
    } catch (error) {
      console.error("Error verifying report:", error);
      res.status(500).send("Error verifying report");
    }
  }
);

module.exports = router;
