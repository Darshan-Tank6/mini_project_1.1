const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
const path = require("path");
const moment = require("moment");
const { JSDOM } = require("jsdom");
const puppeteer = require("puppeteer");
const { ensureAuthenticated, checkRole } = require("../middleware/auth");
const Report = require("../models/Report");
const Tip = require("../models/Tip");

// Show Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Handle Register
// router.post("/register", async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       role,
//       regNo,
//       contactPerson,
//       location,
//       securityPin,
//     } = req.body;

//     const newUser = new User({
//       name,
//       email,
//       password,
//       role,
//       regNo,
//       contactPerson,
//       location,
//       securityPin,
//     });

//     await newUser.save();
//     req.flash("success_msg", "Registration successful! You can now log in.");
//     res.redirect("/auth/login");
//   } catch (err) {
//     req.flash("error_msg", "Error registering user.");
//     res.redirect("/auth/register");
//   }
// });

// router.post("/register", async (req, res) => {
//   try {
//     const {
//       name,
//       email,
//       password,
//       //role,
//       regNo,
//       contactPerson,
//       location,
//       securityPin,
//     } = req.body;

//     const role = Array.isArray(req.body.role)
//       ? req.body.role[0].trim()
//       : req.body.role.trim();

//     if (!name || !regNo || !email || !contactPerson || !location) {
//       req.flash("error_msg", "All fields are required for verification.");
//       return res.redirect("/auth/register");
//     }

//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     try {
//       console.log("Navigating to SEBI website...");
//       await page.goto(
//         "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13",
//         { waitUntil: "domcontentloaded", timeout: 60000 }
//       );

//       console.log("Filling out the form...");
//       await page.type('input[name="name"]', name, { delay: 30 });
//       await page.type('input[name="regNo"]', regNo, { delay: 30 });
//       await page.type('input[name="contPer"]', contactPerson, { delay: 30 });
//       await page.type('input[name="email"]', email, { delay: 30 });
//       await page.type('input[name="location"]', location, { delay: 30 });

//       console.log("Submitting search...");
//       await page.waitForSelector("a.go-search.go_search", { visible: true });
//       await page.click("a.go-search.go_search");

//       console.log("Waiting for results...");
//       await page.waitForSelector(".fixed-table-body", { timeout: 3000 });

//       // Extract results
//       const resultsHtml = await page.evaluate(() => {
//         const resultContainer = document.querySelector(".fixed-table-body");
//         return resultContainer ? resultContainer.innerHTML : "No data found";
//       });

//       console.log("Parsing extracted HTML...");
//       const dom = new JSDOM(resultsHtml);
//       const document = dom.window.document;
//       const extractedData = {};

//       document.querySelectorAll(".card-view").forEach((card) => {
//         const key = card.querySelector(".title span")?.textContent.trim();
//         const value = card.querySelector(".value span")?.textContent.trim();
//         if (key && value) {
//           extractedData[key] = value;
//         }
//       });

//       console.log("Scraped Data:", extractedData);
//       await browser.close();

//       // Check if extracted data matches user input
//       if (
//         extractedData["Name"] !== name ||
//         extractedData["Registration No."] !== regNo ||
//         extractedData["E-mail"] !== email ||
//         extractedData["Contact Person"] !== contactPerson ||
//         extractedData["Address"] !== location
//       ) {
//         req.flash(
//           "error_msg",
//           "Verification failed. Details do not match SEBI records."
//         );
//         return res.redirect("/auth/register");
//       }

//       // **Check validity**
//       const validityText = extractedData["Validity"];
//       if (!validityText) {
//         req.flash("error_msg", "Could not verify validity.");
//         return res.redirect("/auth/register");
//       }

//       if (validityText.includes("Perpetual")) {
//         console.log("Validity is perpetual. Proceeding with registration...");
//       } else {
//         // Extract date range from validity field
//         const dates = validityText.match(/\b\w+ \d{1,2}, \d{4}\b/g);
//         if (!dates || dates.length !== 2) {
//           req.flash("error_msg", "Invalid validity format.");
//           return res.redirect("/auth/register");
//         }

//         const startDate = moment(dates[0], "MMM DD, YYYY");
//         const endDate = moment(dates[1], "MMM DD, YYYY");
//         const today = moment();

//         if (today.isBefore(startDate) || today.isAfter(endDate)) {
//           req.flash("error_msg", "Registration failed. SEBI validity expired.");
//           return res.redirect("/auth/register");
//         }

//         console.log(
//           "Validity is within range. Proceeding with registration..."
//         );
//       }

//       // Proceed with registration
//       const newUser = new User({
//         name,
//         email,
//         password,
//         role,
//         regNo,
//         contactPerson,
//         location,
//         securityPin,
//       });

//       await newUser.save();
//       req.flash("success_msg", "Registration successful! You can now log in.");
//       res.redirect("/auth/login");
//     } catch (error) {
//       console.error("Scraping failed:", error.message);
//       await browser.close();
//       req.flash("error_msg", "Verification failed due to an error.");
//       return res.redirect("/auth/register");
//     }
//   } catch (err) {
//     req.flash("error_msg", "Error registering user.");
//     res.redirect("/auth/register");
//   }
// });

router.post("/register", async (req, res) => {
  try {
    const { name, email, securityPin, password } = req.body;

    if (!name || !email || !securityPin || !password) {
      req.flash("error_msg", "All fields are required.");
      return res.redirect("/auth/register");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error_msg", "Email is already registered.");
      return res.redirect("/auth/register");
    }

    // Hash the password and security pin
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const hashedSecurityPin = await bcrypt.hash(securityPin, 10);

    // Create new user with default role "user"
    const newUser = new User({
      name,
      email,
      password,
      securityPin,
      role: "user", // Default role
    });

    await newUser.save();
    req.flash("success_msg", "Registration successful! You can now log in.");
    res.redirect("/auth/login");
  } catch (err) {
    console.error("Error registering user:", err);
    req.flash("error_msg", "Error registering user. Please try again.");
    res.redirect("/auth/register");
  }
});

// Show Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/verify-user-details", (req, res) => {
  res.render("verify-user");
});

// router.post("/verify-user-details", async (req, res) => {
//   const { name, email, regNo, contactPerson, location } = req.body;

//   if (!req.session.user) {
//     req.flash("error_msg", "You must be logged in to verify.");
//     return res.redirect("/auth/login");
//   }

//   const userId = req.session.user._id; // Get user ID from session

//   if (!name || !email) {
//     req.flash("error_msg", "Name and Email are required.");
//     return res.redirect("/auth/verify-user-details");
//   }

//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   try {
//     console.log("Navigating to SEBI website...");
//     await page.goto(
//       "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13",
//       { waitUntil: "domcontentloaded", timeout: 60000 }
//     );

//     console.log("Filling out the form...");
//     if (name) await page.type('input[name="name"]', name, { delay: 50 });
//     if (regNo) await page.type('input[name="regNo"]', regNo, { delay: 50 });
//     if (contactPerson)
//       await page.type('input[name="contPer"]', contactPerson, { delay: 50 });
//     if (email) await page.type('input[name="email"]', email, { delay: 50 });
//     if (location)
//       await page.type('input[name="location"]', location, { delay: 50 });

//     console.log("Submitting search...");
//     await page.waitForSelector("a.go-search.go_search", { visible: true });
//     await page.click("a.go-search.go_search");

//     console.log("Waiting for results...");
//     await page.waitForSelector(".fixed-table-body", { timeout: 10000 });

//     // Extract results
//     const resultsHtml = await page.evaluate(() => {
//       const resultContainer = document.querySelector(".fixed-table-body");
//       return resultContainer ? resultContainer.innerHTML : "No data found";
//     });

//     await browser.close();

//     // Parse scraped data
//     const dom = new JSDOM(resultsHtml);
//     const document = dom.window.document;
//     const extractedData = {};

//     document.querySelectorAll(".card-view").forEach((card) => {
//       const key = card.querySelector(".title span")?.textContent.trim();
//       const value = card.querySelector(".value span")?.textContent.trim();
//       if (key && value) {
//         extractedData[key] = value;
//       }
//     });

//     console.log("Scraped Data:", extractedData);

//     // Validate scraped data against user input
//     if (
//       extractedData.Name === name &&
//       extractedData["E-mail"] === email &&
//       (!regNo || extractedData["Registration No."] === regNo) &&
//       (!contactPerson || extractedData["Contact Person"] === contactPerson) &&
//       (!location || extractedData.Address.includes(location)) &&
//       extractedData.Validity.includes("Perpetual") // Ensuring it's a valid registration
//     ) {
//       // Update user role & verification status
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { role: "advisor", verified: true },
//         { new: true }
//       );

//       console.log("User verified:", updatedUser);
//       req.flash(
//         "success_msg",
//         "Verification successful! You are now an Advisor."
//       );
//       return res.redirect("/auth/home");
//     } else {
//       req.flash(
//         "error_msg",
//         "Verification failed. Details do not match SEBI records."
//       );
//       return res.redirect("/auth/verify-user-details");
//     }
//   } catch (error) {
//     console.error("Verification failed:", error.message);
//     await browser.close();
//     req.flash("error_msg", "Error verifying details. Please try again.");
//     return res.redirect("/auth/verify-user-details");
//   }
// });

// // Handle Login
// router.post(
//   "/login",
//   passport.authenticate("local", {
//     successRedirect: "/tips",
//     failureRedirect: "/auth/login",
//     failureFlash: true,
//   })
// );

router.post("/verify-user-details", async (req, res) => {
  const { name, email, regNo, contactPerson, location } = req.body;

  if (!req.user) {
    req.flash("error_msg", "You must be logged in to verify.");
    console.log("You must be logged in to verify.");
    return res.redirect("/auth/login");
  }

  const userId = req.user._id; // Get user ID from session
  console.log("User Id: ", userId);

  if (!name || !email || !regNo) {
    req.flash(
      "error_msg",
      "Name, Email, and Registration Number are required."
    );
    return res.redirect("/auth/verify-user-details");
  }

  try {
    // Check if an advisor is already registered with the same email or registration number
    const existingAdvisor = await User.findOne({
      $or: [{ email }, { regNo }],
      role: "advisor",
    });

    if (existingAdvisor) {
      req.flash(
        "error_msg",
        "An advisor with this email or registration number already exists."
      );
      return res.redirect("/auth/verify-user-details");
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log("Navigating to SEBI website...");
    await page.goto(
      "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognisedFpi=yes&intmId=13",
      { waitUntil: "domcontentloaded", timeout: 60000 }
    );

    console.log("Filling out the form...");
    if (name) await page.type('input[name="name"]', name, { delay: 50 });
    if (regNo) await page.type('input[name="regNo"]', regNo, { delay: 50 });
    if (contactPerson)
      await page.type('input[name="contPer"]', contactPerson, { delay: 50 });
    if (email) await page.type('input[name="email"]', email, { delay: 50 });
    if (location)
      await page.type('input[name="location"]', location, { delay: 50 });

    console.log("Submitting search...");
    await page.waitForSelector("a.go-search.go_search", { visible: true });
    await page.click("a.go-search.go_search");

    console.log("Waiting for results...");
    await page.waitForSelector(".fixed-table-body", { timeout: 10000 });

    // Extract results
    const resultsHtml = await page.evaluate(() => {
      const resultContainer = document.querySelector(".fixed-table-body");
      return resultContainer ? resultContainer.innerHTML : "No data found";
    });

    await browser.close();

    // Parse scraped data
    const dom = new JSDOM(resultsHtml);
    const document = dom.window.document;
    const extractedData = {};

    document.querySelectorAll(".card-view").forEach((card) => {
      const key = card.querySelector(".title span")?.textContent.trim();
      const value = card.querySelector(".value span")?.textContent.trim();
      if (key && value) {
        extractedData[key] = value;
      }
    });

    console.log("Scraped Data:", extractedData);

    // Validate scraped data against user input
    if (
      extractedData.Name === name &&
      extractedData["E-mail"] === email &&
      extractedData["Registration No."] === regNo &&
      (!contactPerson || extractedData["Contact Person"] === contactPerson) &&
      (!location || extractedData.Address.includes(location)) &&
      extractedData.Validity.includes("Perpetual") // Ensuring it's a valid registration
    ) {
      // Update user role & verification status
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          role: "advisor",
          verified: true,
          regNo: regNo,
          location: location,
          contactPerson: contactPerson,
        },
        { new: true }
      );

      console.log("User verified:", updatedUser);
      req.flash(
        "success_msg",
        "Verification successful! You are now an Advisor."
      );
      return res.redirect("/auth/home");
    } else {
      req.flash(
        "error_msg",
        "Verification failed. Details do not match SEBI records."
      );
      return res.redirect("/auth/verify-user-details");
    }
  } catch (error) {
    console.error("Verification failed:", error.message);
    req.flash("error_msg", "Error verifying details. Please try again.");
    return res.redirect("/auth/verify-user-details");
  }
});

// Login Route - Step 1 (Password Verification)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error_msg", info.message);
      return res.redirect("/auth/login");
    }

    // Save user ID in session for PIN verification
    req.session.tempUserId = user._id;
    res.redirect("/auth/verify-pin");
  })(req, res, next);
});

// Render PIN Verification Page
router.get("/verify-pin", (req, res) => {
  if (!req.session.tempUserId) {
    req.flash("error_msg", "Unauthorized access.");
    return res.redirect("/auth/login");
  }
  res.render("verify-pin");
});

// Handle PIN Verification
router.post("/verify-pin", async (req, res) => {
  try {
    const { securityPin } = req.body;
    const user = await User.findById(req.session.tempUserId);

    if (!user || !(await user.compareSecurityPin(securityPin))) {
      req.flash("error_msg", "Invalid security PIN.");
      return res.redirect("/auth/verify-pin");
    }

    // Login user after successful PIN verification
    req.login(user, (err) => {
      if (err) return next(err);
      delete req.session.tempUserId; // Remove temp user ID after successful login
      //console.log("req.session._id", req.session.user);
      res.redirect("/auth/profile-page");
    });
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "Error verifying PIN.");
    res.redirect("/auth/verify-pin");
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.flash("success_msg", "You are logged out");
    res.redirect("/auth/login");
  });
});

router.get("/home", (req, res) => {
  res.render("../public/home_screen");
});

// router.get("/profile-page", (req, res) => {
//   res.render("profile-page");
// });

router.get("/profile-page", ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id; // Get logged-in user's ID
    const user = await User.findById(userId).select("name email role");

    if (!user) {
      req.flash("error_msg", "User not found.");
      return res.redirect("/auth/login");
    }

    // Fetch reports submitted by the user
    const submittedReports = await Report.find({ postedBy: userId });

    // Fetch reports verified by the user
    const verifiedReports = await Report.find({ verifiedBy: userId });

    //Fetch tips submitted by user
    const submittedTips = await Tip.find({ postedBy: userId });

    // Count of reports
    const submittedCount = submittedReports.length;
    const verifiedCount = verifiedReports.length;
    const submittedTipCount = submittedTips.length;

    res.render("profile-page", {
      user,
      submittedReports,
      verifiedReports,
      submittedCount,
      verifiedCount,
      submittedTips,
      submittedTipCount,
    });
  } catch (error) {
    console.error("Error fetching profile data:", error);
    req.flash("error_msg", "Error loading profile.");
    res.redirect("/auth/home");
  }
});

router.get("/reset-password", async (req, res) => {
  res.render("reset-password");
});

router.get("/reset-pin", async (req, res) => {
  res.render("reset-pin");
});

// 📌 Reset Password (Requires Current Password)
router.post("/reset-password", ensureAuthenticated, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user || !(await user.comparePassword(currentPassword))) {
    req.flash("error_msg", "Invalid password .");
    return res.redirect("profile-page");
  }

  user.password = newPassword;
  await user.save();

  //res.redirect("profile-page");
  res.json({ message: "Password successfully updated!" });
});

// 📌 Reset Security PIN (Requires Current PIN)
router.post("/reset-pin", ensureAuthenticated, async (req, res) => {
  const { currentPin, newPin } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) return res.status(404).json({ error: "User not found" });

  if (!user || !(await user.compareSecurityPin(currentPin))) {
    req.flash("error_msg", "Invalid PIN.");
    return res.redirect("profile-page");
  }

  user.securityPin = newPin;
  await user.save();

  res.json({ message: "Security PIN successfully updated!" });
});

router.post("/delete/self/:id", async (req, res) => {
  const password = req.body;
  const user = await User.findById(req.params.id);
  if (!user || !(await user.comparePassword(password))) {
    req.flash("error_msg", "Invalid password .");
    return res.redirect("profile-page");
  }
  await user.deleteOne();
  res.redirect("profile-page");
});

router.get("/delete/self", async (req, res) => {
  res.render("delete-confirm");
});

router.get("/setting", async (req, res) => {
  res.render("settings");
});

module.exports = router;
