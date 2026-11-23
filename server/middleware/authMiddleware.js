
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
   try {
      // ==========================================
      // 1. CHECK JWT SECRET
      // ==========================================

      if (!process.env.JWT_SECRET) {
         console.error("JWT_SECRET is missing in .env");

         return res.status(500).json({
            success: false,
            message: "Server authentication configuration is missing.",
         });
      }

      // ==========================================
      // 2. GET AUTHORIZATION HEADER
      // ==========================================

      const authHeader = req.headers.authorization;

      if (!authHeader) {
         return res.status(401).json({
            success: false,
            message: "Authentication required.",
         });
      }

      // ==========================================
      // 3. CHECK BEARER FORMAT
      // ==========================================

      if (!authHeader.startsWith("Bearer ")) {
         return res.status(401).json({
            success: false,
            message: "Invalid authorization format.",
         });
      }

      // ==========================================
      // 4. GET TOKEN
      // ==========================================

      const token = authHeader.substring(7).trim();

      if (!token) {
         return res.status(401).json({
            success: false,
            message: "Authentication token missing.",
         });
      }

      // ==========================================
      // 5. VERIFY JWT
      // ==========================================

      let decoded;

      try {
         decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (jwtError) {
         console.error("JWT ERROR:", jwtError.name, jwtError.message);

         if (jwtError.name === "TokenExpiredError") {
            return res.status(401).json({
               success: false,
               message: "Token expired. Please login again.",
               code: "TOKEN_EXPIRED",
            });
         }

         return res.status(401).json({
            success: false,
            message: "Invalid authentication token. Please login again.",
            code: "INVALID_TOKEN",
         });
      }

      // ==========================================
      // 6. CHECK TOKEN PAYLOAD
      // ==========================================

      const userId = decoded?.id || decoded?._id;

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: "Invalid token payload.",
            code: "INVALID_PAYLOAD",
         });
      }

      // ==========================================
      // 7. FIND USER IN DATABASE
      // ==========================================

      const user = await User.findById(userId).select("-password");

      if (!user) {
         return res.status(401).json({
            success: false,
            message: "User account not found.",
            code: "USER_NOT_FOUND",
         });
      }

      // ==========================================
      // 8. CHECK ACCOUNT STATUS
      // ==========================================

      // Block only when explicitly inactive
      if (user.isActive === false) {
         return res.status(403).json({
            success: false,
            message: "Your account is inactive.",
            code: "ACCOUNT_INACTIVE",
         });
      }

      // ==========================================
      // 9. NORMALIZE USER ROLE
      // ==========================================

      const normalizedRole = String(user.role || "")
         .trim()
         .toLowerCase();

      if (!normalizedRole) {
         return res.status(403).json({
            success: false,
            message: "User role is missing.",
            code: "ROLE_MISSING",
         });
      }

      // ==========================================
      // 10. ATTACH USER TO REQUEST
      // ==========================================

      req.user = user;

      req.auth = {
         id: user._id.toString(),
         userId: decoded.userId || user.userId,
         role: normalizedRole,
      };

      // ==========================================
      // 11. CONTINUE
      // ==========================================

      next();

   } catch (error) {
      console.error("AUTH MIDDLEWARE ERROR:", error);

      return res.status(500).json({
         success: false,
         message: "Authentication failed.",
      });
   }
};
