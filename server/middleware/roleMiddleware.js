
const authorizeRoles = (...allowedRoles) => {
   return (req, res, next) => {
      try {
         if (!req.user) {
            return res.status(401).json({
               success: false,
               message: "Authentication required",
            });
         }

         const userRole = String(
            req.user.role || req.auth?.role || ""
         )
            .trim()
            .toLowerCase();

         const normalizedAllowedRoles = allowedRoles.map((role) =>
            String(role).trim().toLowerCase()
         );

         console.log("ROLE CHECK:", {
            userRole,
            allowedRoles: normalizedAllowedRoles,
            userId: req.user._id,
         });

         if (!normalizedAllowedRoles.includes(userRole)) {
            return res.status(403).json({
               success: false,
               message: "You are not allowed to access this resource",
               userRole,
               allowedRoles: normalizedAllowedRoles,
            });
         }

         return next();
      } catch (error) {
         console.error("ROLE MIDDLEWARE ERROR:", error);

         return res.status(500).json({
            success: false,
            message: "Role authorization failed",
         });
      }
   };
};

export { authorizeRoles };
