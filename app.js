// const express = require("express");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const passport = require("passport");
// const LocalStrategy = require("passport-local").Strategy;
// const bodyParser = require("body-parser");
// const methodOverride = require("method-override");
// const flash = require("connect-flash");
// const MongoStore = require("connect-mongo");
// const path = require("path");
// require("dotenv").config();

// const User = require("./models/User"); // User model
// const tipsRoutes = require("./routes/tips"); // Tips routes
// const authRoutes = require("./routes/auth"); // Auth routes
// const reportRoutes = require("./routes/report"); // Report routes

// const app = express();

// // 📌 Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("❌ MongoDB connection error:", err));

// // 📌 Set up session with MongoDB store
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "supersecretkey",
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
//     cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }, // 1-hour session
//   })
// );

// // 📌 Initialize Passport.js for authentication
// app.use(passport.initialize());
// app.use(passport.session());

// // 📌 Passport local strategy (using email as username)
// passport.use(
//   new LocalStrategy(
//     { usernameField: "email" },
//     async (email, password, done) => {
//       try {
//         const user = await User.findOne({ email });
//         if (!user || !(await user.comparePassword(password))) {
//           return done(null, false, { message: "Invalid email or password" });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err);
//       }
//     }
//   )
// );

// passport.serializeUser((user, done) => done(null, user.id));
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });

// // 📌 Middleware
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, "public"))); // Serve static files
// app.use(methodOverride("_method")); // Allow PUT/DELETE in forms
// app.use(flash());

// // 📌 EJS View Engine
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));

// // 📌 Global variables for flash messages
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   res.locals.success_msg = req.flash("success_msg");
//   res.locals.error_msg = req.flash("error_msg");
//   res.locals.error = req.flash("error");
//   next();
// });

// // 📌 Routes
// app.use("/auth", authRoutes); // Authentication routes
// app.use("/tips", tipsRoutes); // Tips routes
// app.use("/reports", reportRoutes);

// // 📌 Home Route
// app.get("/", (req, res) => {
//   res.redirect("/tips"); // Redirect to tips page
// });

// // 📌 Start the Server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () =>
//   console.log(`🚀 Server running on http://localhost:${PORT}`)
// );

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const path = require("path");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const compression = require("compression");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Load Environment Variables
dotenv.config();

// Import Configurations
const connectDB = require("./config/db");
require("./config/passport"); // Load Passport strategy

// Import Routes
const tipsRoutes = require("./routes/tips");
const authRoutes = require("./routes/auth");
const reportRoutes = require("./routes/report");
const adminRoutes = require("./routes/admin");

const app = express();

// 📌 Connect to MongoDB
connectDB();

// 📌 Security Middlewares
// app.use(helmet()); // Secure HTTP headers
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'"],
//         styleSrc: ["'self'", "https://fonts.googleapis.com"],
//         fontSrc: ["'self'", "https://fonts.gstatic.com"],
//       },
//     },
//   })
// );
//app.use(compression()); // Gzip compression for performance

// 📌 Rate Limiting (Prevents brute force attacks)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});

//app.use(limiter);

// 📌 Session Setup (With Secure Cookie)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // Set secure flag in production
      httpOnly: true, // Prevents client-side JS access
      sameSite: "strict", // Prevent CSRF attacks
      maxAge: 1000 * 60 * 60, // 1-hour session expiry
    },
  })
);

// 📌 Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// 📌 Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files
app.use(methodOverride("_method")); // Allow PUT/DELETE in forms
app.use(flash());

// 📌 View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 📌 Global Variables (Flash Messages)
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// 📌 Routes
app.use("/auth", authRoutes);
app.use("/tips", tipsRoutes);
app.use("/reports", reportRoutes);
app.use("/admin", adminRoutes);

// 📌 Home Route
app.get("/", (req, res) => res.redirect("/auth/login"));

// 📌 404 Error Handler
app.use((req, res) => {
  res.status(404).render("404", { title: "404 - Not Found" });
});

// 📌 Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
