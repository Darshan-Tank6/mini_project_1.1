// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   email: { type: String, unique: true, required: true },
//   password: { type: String, required: true },
//   role: {
//     type: String,
//     enum: ["user", "advisor", "admin"],
//     default: "user",
//   },
// });

// // Hash password before saving
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Compare password method
// userSchema.methods.comparePassword = function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model("User", userSchema);

////////////////////////////////////////////
// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: { type: String, required: true, unique: true, trim: true },
//   password: { type: String, required: true },
//   role: { type: String, enum: ["user", "advisor", "admin"], required: true },

//   // Only required if role === "advisor"
//   regNo: { type: String, trim: true, default: null },
//   contactPerson: { type: String, trim: true, default: null },
//   location: { type: String, trim: true, default: null },

//   // Security
//   securityPin: { type: String, required: false }, // 4-6 digit PIN for extra security
//   createdAt: { type: Date, default: Date.now },
// });

// // 📌 Middleware: Hash password and security PIN before saving
// userSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//   }
//   if (this.isModified("securityPin")) {
//     const salt = await bcrypt.genSalt(10);
//     this.securityPin = await bcrypt.hash(this.securityPin, salt);
//   }
//   next();
// });

// // 📌 Method to compare passwords
// userSchema.methods.comparePassword = function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// // 📌 Method to compare security PIN
// userSchema.methods.compareSecurityPin = function (enteredPin) {
//   return bcrypt.compare(enteredPin, this.securityPin);
// };

// // 📌 Role-based validation before saving
// userSchema.pre("validate", function (next) {
//   if (this.role === "user" || this.role === "admin") {
//     this.regNo = null;
//     this.contactPerson = null;
//     this.location = null;
//   } else if (this.role === "advisor") {
//     if (!this.regNo || !this.contactPerson || !this.location) {
//       return next(
//         new Error("Advisors must have regNo, contactPerson, and location")
//       );
//     }
//   }
//   next();
// });

// module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  securityPin: { type: String, required: true },
  role: { type: String, enum: ["user", "advisor", "admin"], required: true },
  regNo: { type: String, trim: true, default: null },
  contactPerson: { type: String, trim: true, default: null },
  location: { type: String, trim: true, default: null },

  // Security Features
  failedAttempts: { type: Number, default: 0 }, // Track failed login attempts
  lockUntil: { type: Date, default: null }, // Account lock time

  verified: { type: Boolean, default: false }, // Field to track verification status

  // 🔹 PIN Reset Fields
  resetPinToken: { type: String, default: null },
  resetPinExpires: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now },
});

// Hash password and security PIN before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  if (this.isModified("securityPin")) {
    const salt = await bcrypt.genSalt(10);
    this.securityPin = await bcrypt.hash(this.securityPin, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Compare security PIN method
userSchema.methods.compareSecurityPin = function (enteredPin) {
  return bcrypt.compare(enteredPin, this.securityPin);
};

// 📌 Role-based validation before saving
userSchema.pre("validate", function (next) {
  if (this.role === "user" || this.role === "admin") {
    this.regNo = null;
    this.contactPerson = null;
    this.location = null;
  } else if (this.role === "advisor") {
    if (!this.regNo || !this.contactPerson || !this.location) {
      return next(
        new Error("Advisors must have regNo, contactPerson, and location")
      );
    }
  }
  next();
});

// 🔹 Generate Reset Token (For Password & PIN)
userSchema.methods.generateResetToken = function (type) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = Date.now() + 3600000; // 1 hour expiry

  if (type === "password") {
    this.resetPasswordToken = token;
    this.resetPasswordExpires = expires;
  } else if (type === "pin") {
    this.resetPinToken = token;
    this.resetPinExpires = expires;
  }

  return token;
};

module.exports = mongoose.model("User", userSchema);
