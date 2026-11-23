import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

const seedAdmin = async () => {
   try {
      // Connect MongoDB
      await connectDB();

      const password = "Admin@12345";

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Check existing admin
      const existingAdmin = await User.findOne({
         userId: "ADM001",
      });

      // =====================================================
      // ADMIN ALREADY EXISTS
      // =====================================================

      if (existingAdmin) {
         existingAdmin.name = "School Administrator";
         existingAdmin.userId = "ADM001";
         existingAdmin.password = hashedPassword;
         existingAdmin.role = "admin";
         existingAdmin.isActive = true;

         await existingAdmin.save();

         console.log("================================");
         console.log("✅ Admin Updated Successfully");
         console.log("User ID: ADM001");
         console.log("Password: Admin@12345");
         console.log("Role: admin");
         console.log("Status: Active");
         console.log("================================");

         await mongoose.connection.close();
         process.exit(0);
      }

      // =====================================================
      // CREATE NEW ADMIN
      // =====================================================

      await User.create({
         name: "School Administrator",
         userId: "ADM001",
         password: hashedPassword,
         role: "admin",
         isActive: true,
      });

      console.log("================================");
      console.log("✅ Admin Created Successfully");
      console.log("User ID: ADM001");
      console.log("Password: Admin@12345");
      console.log("Role: admin");
      console.log("Status: Active");
      console.log("================================");

      await mongoose.connection.close();
      process.exit(0);
   } catch (error) {
      console.error("❌ Seed Admin Error:", error);

      try {
         await mongoose.connection.close();
      } catch (closeError) {
         console.error("MongoDB close error:", closeError.message);
      }

      process.exit(1);
   }
};

seedAdmin();