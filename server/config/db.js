import mongoose from "mongoose";

const connectDB = async () => {
   try {
      if (!process.env.MONGO_URI) {
         console.error("❌ MONGO_URI is missing in .env");
         process.exit(1);
      }

      const connection = await mongoose.connect(process.env.MONGO_URI);

      console.log(
         `✅ MongoDB Connected: ${connection.connection.host}`
      );
   } catch (error) {
      console.error("❌ MongoDB Connection Error:", error.message);
      process.exit(1);
   }
};

export default connectDB;