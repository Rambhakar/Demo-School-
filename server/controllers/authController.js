
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req, res) => {
   try {
      const { userId, password, role } = req.body;

      // Validate input
      if (!userId || !password || !role) {
         return res.status(400).json({
            success: false,
            message: "User ID, password and role are required",
         });
      }

      // Normalize values
      const normalizedUserId = String(userId).trim().toUpperCase();
      const normalizedRole = String(role).trim().toLowerCase();

      // Find user
      const user = await User.findOne({
         userId: normalizedUserId,
         role: normalizedRole,
      });

      // Debug logs
      console.log("========== LOGIN DEBUG ==========");
      console.log("User ID:", normalizedUserId);
      console.log("Role:", normalizedRole);
      console.log("User Found:", Boolean(user));
      console.log("Account Active:", user?.isActive);
      console.log("=================================");

      if (!user) {
         return res.status(401).json({
            success: false,
            message: "Invalid User ID or password",
         });
      }

      if (!user.isActive) {
         return res.status(403).json({
            success: false,
            message: "Your account is disabled",
         });
      }

      // Check password
      const isPasswordCorrect = await bcrypt.compare(
         password,
         user.password
      );

      console.log("Password Match:", isPasswordCorrect);

      if (!isPasswordCorrect) {
         return res.status(401).json({
            success: false,
            message: "Invalid User ID or password",
         });
      }

      // Check JWT secret
      if (!process.env.JWT_SECRET) {
         console.error("JWT_SECRET is missing");

         return res.status(500).json({
            success: false,
            message: "Server configuration error",
         });
      }

      // Generate JWT token
      const token = jwt.sign(
         {
            id: user._id,
            userId: user.userId,
            role: user.role,
         },
         process.env.JWT_SECRET,
         {
            expiresIn: "1d",
         }
      );

      return res.status(200).json({
         success: true,
         message: "Login successful",
         token,
         user: {
            id: user._id,
            name: user.name,
            userId: user.userId,
            role: user.role,
         },
      });

   } catch (error) {
      console.error("Login Error:", error);

      return res.status(500).json({
         success: false,
         message: "Server error",
      });
   }
};
