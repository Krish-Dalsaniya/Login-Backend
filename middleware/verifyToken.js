const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // 1. Get token from the header
  const token = req.header("auth-token");
  if (!token) return res.status(401).send("Access Denied: No Token Provided");

  try {
    // 2. Verify the token
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified; // Add user data (id, role) to the request
    next(); // Move to the next function (the actual route)
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};
