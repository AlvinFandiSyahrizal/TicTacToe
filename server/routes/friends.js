import { Router } from "express";
import {
  sendRequest, respondRequest,
  getFriends, getPending, getFriendStats,
} from "../controllers/friendsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/request",        sendRequest);
router.post("/respond",        respondRequest);
router.get("/list",            getFriends);
router.get("/pending",         getPending);
router.get("/stats/:friendId", getFriendStats); 

export default router;