import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
   {
      // User Name
      name: {
         type: String,
         required: true,
         trim: true,
      },

      // Login User ID
      userId: {
         type: String,
         required: true,
         unique: true,
         uppercase: true,
         trim: true,
      },

      // Hashed Password
      password: {
         type: String,
         required: true,
         minlength: 6,
      },

      // User Role
      role: {
         type: String,
         enum: ["admin", "teacher", "student"],
         required: true,
      },

      // Account Status
      isActive: {
         type: Boolean,
         default: true,
      },
   },
   {
      timestamps: true,
   }
);

const User = mongoose.model("User", userSchema);

export default User;