//routes/tagRoutes.js
import express from "express";
import {
  createTag,
  getTags,
  updateTag,
  deleteTag,
  addTagToTask,
  removeTagFromTask,
} from "../controllers/tagController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", checkPermission("tag:create"), createTag);
router.get("/", checkPermission("tag:read"), getTags);
router.put("/:id", checkPermission("tag:update"), updateTag);
router.delete("/:id", checkPermission("tag:delete"), deleteTag);

// ðŸ”¹ Ø¨Ø±Ú†Ø³Ø¨â€ŒÚ¯Ø°Ø§Ø±ÛŒ ØªØ³Ú©â€ŒÙ‡Ø§
router.post("/task/:id/add", checkPermission("task:edit"), addTagToTask);
router.post("/task/:id/remove", checkPermission("task:edit"), removeTagFromTask);

export default router;
