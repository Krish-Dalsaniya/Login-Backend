const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verify = require("../middleware/authMiddleware");

router.get("/test", (req, res) => res.send("Auth Route is Connected!"));

// Dummy Route to this:
router.get("/me", verify, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // Find user by ID stored in token
    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// REGISTER
router.post("/register", async (req, res) => {
  try {
    // 1. Check if user already exists (SQL version)
    const emailExist = await User.findOne({ where: { email: req.body.email } });
    if (emailExist) return res.status(400).send("Email already exists");

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // 3. Create User in PostgreSQL
    const savedUser = await User.create({
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || "attendant",
    });

    res.status(201).send({
      message: "Success! User saved to Postgres",
      userId: savedUser.id,
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    // 1. Check if email exists
    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(400).send("Email not found");

    // 2. Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send("Invalid password");

    // 3. Create and assign a token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.TOKEN_SECRET,
      { expiresIn: "1h" },
    );

    res.header("auth-token", token).send({
      message: "Logged in successfully!",
      token: token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role, // This is what the frontend is looking for!
      },
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
