import { Router } from "express";
import { leaderboard, getProfile, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/leaderboard",    leaderboard);
router.get("/:username",      getProfile);
router.patch("/update",       authMiddleware, updateProfile);

export default router;