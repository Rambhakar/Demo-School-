
import { randomInt } from "crypto";
import User from "../models/User.js";

// ==========================================
// GENERATE USER ID
// Student: STU123456
// Teacher: TCH123456
// ==========================================

export const generateUserId = async (role) => {
   let prefix = "USR";

   if (role === "student") prefix = "STU";
   if (role === "teacher") prefix = "TCH";

   for (let attempt = 0; attempt < 20; attempt++) {
      const userId = `${prefix}${randomInt(100000, 1000000)}`;

      const exists = await User.exists({ userId });

      if (!exists) {
         return userId;
      }
   }

   throw new Error("Unable to generate a unique User ID");
};

// ==========================================
// GENERATE APPLICATION NUMBER
// ADM-2026-123456
// ==========================================

export const generateApplicationNumber = async (Admission) => {
   const year = new Date().getFullYear();

   for (let attempt = 0; attempt < 20; attempt++) {
      const number = randomInt(100000, 1000000);
      const applicationNumber = `ADM-${year}-${number}`;

      const exists = await Admission.exists({
         applicationNumber,
      });

      if (!exists) {
         return applicationNumber;
      }
   }

   throw new Error("Unable to generate a unique Application Number");
};
