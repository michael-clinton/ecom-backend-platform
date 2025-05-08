const crypto = require("crypto");

exports.getSessionId = (req, res, next) => {
  // Check if the sessionId cookie exists
  if (!req.cookies.sessionId) {
    const sessionId = crypto.randomUUID();  // Generate a new session ID if not available

    // Set the sessionId cookie in the response
    res.cookie("sessionId", sessionId, {
      httpOnly: true,  // Ensures the cookie is not accessible from JavaScript
      secure: process.env.NODE_ENV === "production",  // Only secure in production
      sameSite: "Strict",  // Ensures cookies are only sent in same-site requests
      maxAge: 1000 * 60 * 60 * 24,  // Set cookie expiration (1 day)
    });

    req.sessionId = sessionId;  // Set sessionId to the request object for later use
  } else {
    // If sessionId exists in the cookies, use it
    req.sessionId = req.cookies.sessionId;
  }

  req.userId = req.user?.id || null;  // If the user is authenticated, set the user ID

  next();  // Pass control to the next middleware/handler
};
