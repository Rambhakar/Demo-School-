
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
   try {
      // Check admin password
      if (!process.env.ADMIN_INITIAL_PASSWORD) {
         throw new Error(
            "ADMIN_INITIAL_PASSWORD is missing in server/.env"
         );
      }

      // Connect to MongoDB
      await connectDB();

      // Hash the new admin password
      const hashedPassword = await bcrypt.hash(
         process.env.ADMIN_INITIAL_PASSWORD,
         12
      );

      // Create admin if missing, otherwise update existing admin
      const admin = await User.findOneAndUpdate(
         { userId: "ADM001" },
         {
            $set: {
               name: "School Administrator",
               userId: "ADM001",
               password: hashedPassword,
               role: "admin",
               isActive: true,
            },
         },
         {
            new: true,
            upsert: true,
            runValidators: true,
         }
      );

      console.log("Admin created/updated successfully!");
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
