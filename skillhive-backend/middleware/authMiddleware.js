// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // Adjust path if needed

// ✅ Protect routes - verify token and attach user
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token) or cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (e.g., "Bearer eyJhbGci...")
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token's ID, excluding the password
      // This fetched user WILL include language and interests if they exist in the DB
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
         throw new Error('User not found');
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error("Authentication Error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else if (req.cookies?.token) { // Fallback to check cookies if header not present
     try {
         token = req.cookies.token;
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         req.user = await User.findById(decoded.id).select("-password");
         if (!req.user) {
             throw new Error('User not found');
         }
         next();
     } catch(error) {
        console.error("Authentication Error (Cookie):", error);
        res.status(401).json({ message: "Not authorized, token failed" });
     }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ✅ Admin check - verify user is an admin
export const admin = (req, res, next) => {
  // Assumes 'protect' middleware has already run and attached req.user
  if (req.user && req.user.role === "admin") {
    next(); // User is admin, proceed
  } else {
    res.status(403).json({ message: "Not authorized as an admin" });
  }
};