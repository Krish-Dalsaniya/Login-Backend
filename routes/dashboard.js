const router = require("express").Router();
const verify = require("../middleware/verifyToken"); // Your new guard
const checkRole = require("../middleware/roleMiddleware");

// This route is now protected!
router.get(
  "/sales-report",
  verify,
  checkRole(["accountant", "manager", "accountant"]),
  (req, res) => {
    res.json({
      message:
        "Sensitive Financial Data For Accountant and Manager Role Only !",
      user: req.user, // Access the ID and Role from the token here
    });
  },
);

module.exports = router;
