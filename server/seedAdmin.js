
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
   try {
      if (!process.env.ADMIN_INITIAL_PASSWORD) {
         throw new Error("ADMIN_INITIAL_PASSWORD is missing in server/.env");
      }

      await connectDB();

      const existingAdmin = await User.findOne({
         userId: "ADM001",
      });

      if (existingAdmin) {
         console.log("Admin ADM001 already exists. No changes made.");
         return;
      }

      const hashedPassword = await bcrypt.hash(
         process.env.ADMIN_INITIAL_PASSWORD,
         12
      );

      const admin = await User.create({
         name: "School Administrator",
         userId: "ADM001",
         password: hashedPassword,
         role: "admin",
         isActive: true,
      });

      console.log("Admin created successfully!");
      console.log("Admin ID:", admin.userId);
      console.log("Role:", admin.role);

   } catch (error) {
      console.error("Admin Seed Error:", error);
      process.exitCode = 1;
   } finally {
      await mongoose.disconnect();
   }
};

seedAdmin();
