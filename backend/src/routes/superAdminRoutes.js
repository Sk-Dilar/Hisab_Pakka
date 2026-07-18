import express from "express";
import * as superAdminController from "../controllers/superAdminController.js";
import { protectSuperAdmin } from "../middleware/superAdminMiddleware.js";

const router = express.Router();

router.post("/login", superAdminController.login);
router.get("/users", protectSuperAdmin, superAdminController.listUsers);
router.post(
  "/users/:id/generate-reset-link",
  protectSuperAdmin,
  superAdminController.generateResetLink,
);

export default router;
