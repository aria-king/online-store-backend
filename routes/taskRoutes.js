// routes/taskRoutes.js
import express from "express";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignUsersToTask,
  removeUsersFromTask,
  uploadTaskFile,
  addTagsToTask,
  removeTagsFromTask,
  getTaskHistory,
} from "../controllers/taskController.js";

import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { auditMiddleware } from "../middleware/auditMiddleware.js";
import { clientInfoMiddleware } from "../middleware/clientInfoMiddleware.js"; // ✅ درستش اینه
import upload from "../middleware/upload.js";

const router = express.Router();

/* =======================
   📋 عملیات اصلی تسک‌ها
======================= */
router.post(
  "/",
  protect,
  clientInfoMiddleware, // ✅ به‌جای clientInfo
  checkPermission(["admin", "manager", "create_task"]),
  auditMiddleware("Task", "create"),
  createTask
);

router.get(
  "/",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "view_tasks"]),
  getTasks
);

router.get(
  "/:id",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "view_task"]),
  getTaskById
);

router.put(
  "/:id",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "edit_task"]),
  auditMiddleware("Task", "update"),
  updateTask
);

router.delete(
  "/:id",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "delete_task"]),
  auditMiddleware("Task", "delete"),
  deleteTask
);

/* =======================
   👥 مدیریت کاربران تسک
======================= */
router.post(
  "/:id/assign",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "assign_task"]),
  auditMiddleware("Task", "assign_users"),
  assignUsersToTask
);

router.delete(
  "/:id/remove-users",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "assign_task"]),
  auditMiddleware("Task", "remove_users"),
  removeUsersFromTask
);

/* =======================
   📎 فایل‌ها
======================= */
router.post(
  "/:id/upload",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "upload_task_file"]),
  upload.single("file"),
  auditMiddleware("Task", "upload_file"),
  uploadTaskFile
);

/* =======================
   🏷️ تگ‌ها
======================= */
router.post(
  "/:id/tags/add",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "tag:update"]),
  auditMiddleware("Task", "add_tags"),
  addTagsToTask
);

router.post(
  "/:id/tags/remove",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "tag:update"]),
  auditMiddleware("Task", "remove_tags"),
  removeTagsFromTask
);

/* =======================
   📜 تاریخچه تغییرات
======================= */
router.get(
  "/:id/history",
  protect,
  clientInfoMiddleware,
  checkPermission(["admin", "manager", "view_task_history"]),
  getTaskHistory
);

export default router;
