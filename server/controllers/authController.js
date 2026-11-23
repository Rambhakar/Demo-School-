import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const login = async (req, res) => {
   try {
      const { userId, password, role } = req.body;

      if (!userId || !password || !role) {
         return res.status(400).json({
            success: false,
            message: "User ID, password and role are required",
         });
      }

      const user = await User.findOne({
         userId: userId.toUpperCase(),
         role: role.toLowerCase(),
      });

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

      const isPasswordCorrect = await bcrypt.compare(
         password,
         user.password
      );

      if (!isPasswordCorrect) {
         return res.status(401).json({
            success: false,
            message: "Invalid User ID or password",
         });
      }

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