const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
require("dotenv").config();


const isEmailVerified = async (request, response, next) => {
  let token;

  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = request.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      request.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return response.status(401).json({
        message: "Token verification failed. Invalid or expired token.",
      });
    }
  } else {
    return response.status(401).json({
      message: "Not authorized, no token",
    });
  }
};
module.exports = {
  isEmailVerified,
};
