
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";

// ==========================================
// ENVIRONMENT
// ==========================================

dotenv.config();

// ==========================================
// APP
// ==========================================

const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
   cors({
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
   })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
   res.status(200).json({
      success: true,
      message: "School Management API is running 🚀",
   });
});

// ==========================================
// API ROUTES
// ==========================================

// Authentication
app.use("/api/auth", authRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// Admissions
app.use("/api/admissions", admissionRoutes);

// Student
app.use("/api/student", studentRoutes);

// Teacher
app.use("/api/teacher", teacherRoutes);

// Attendance
app.use("/api/attendance", attendanceRoutes);

// Results
app.use("/api/results", resultRoutes);

// Subjects
app.use("/api/subjects", subjectRoutes);

// ==========================================
// 404 ROUTE
// ==========================================

app.use((req, res) => {
   res.status(404).json({
      success: false,
      message: "API route not found",
      path: req.originalUrl,
   });
});

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
   console.error("SERVER ERROR:", err);

   res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
   });
});

// ==========================================
// SERVER START
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
   try {
      await connectDB();

      app.listen(PORT, () => {
         console.log("========================================");
         console.log("School Management Server Started 🚀");
         console.log(`Server: http://localhost:${PORT}`);
         console.log(
            `Client: ${process.env.CLIENT_URL || "http://localhost:5173"}`
         );
         console.log("MongoDB Connected Successfully");
         console.log("========================================");
      });
   } catch (error) {
      console.error("❌ Server Startup Error:", error.message);
      process.exit(1);
   }
};

startServer();
