import jwt from "jsonwebtoken";

// Protect superadmin routes - verify JWT token carries the superadmin role
export const protectSuperAdmin = (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.role !== "superadmin") {
        return res.status(403).json({ message: "Not authorized as superadmin" });
      }

      req.superAdmin = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  } catch (error) {
    console.error("SuperAdmin Middleware Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
