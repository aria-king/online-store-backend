import express from "express";
import {
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "../controllers/announcementReadController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/mark-read", markAsRead);
router.post("/mark-all", markAllAsRead);
router.get("/unread-count", getUnreadCount);

export default router;
