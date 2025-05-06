const express = require("express");
const router = express.Router();
const Report = require("../models/Report"); // Import Tip model
const User = require("../models/User"); // Assuming user model exists
// const { isAuthenticated } = require("../middleware/auth"); // Middleware to check login
const { ensureAuthenticated, checkRole } = require("../middleware/auth");

// Add new Report
router.post("/add", ensureAuthenticated, async (req, res) => {
  try {
    const newReport = new Report({
      title: req.body.title,
      content: req.body.content,
      postedBy: req.user._id, // Assuming req.user exists after authentication
    });
    await newReport.save();
    req.flash("success_msg", "Report filed successfully");
    res.redirect("/reports");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error addng Report");
    res.status(500);
    // .send("Error adding Report");
  }
});

// Display all Reports sorted by date (newest first)
router.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("postedBy", "name")
      .populate("verifiedBy", "name")
      .sort({ createdOn: -1 });
    res.render("reports", { reports });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error fetching reports");
    res.status(500).send("Error fetching reports");
  }
});

// Delete a report
router.post(
  "/:id/delete",
  ensureAuthenticated,
  checkRole(["advisor", "admin"]),
  async (req, res) => {
    try {
      await Report.findByIdAndDelete(req.params.id);
      req.flash("success_msg", "Report deleted successfully");
      res.redirect("/reports");
    } catch (err) {
      console.error(err);
      req.flash("error_msg", "Error deleting report");
      res.status(500).send("Error deleting report");
    }
  }
);

//Verify report
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
      report.status = "True";

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

router.post(
  "/:id/false",
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
      report.status = "False";

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
