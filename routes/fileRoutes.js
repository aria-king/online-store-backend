import express from "express";
import { upload } from "../services/fileService.js";
import { uploadFile, getFiles, deleteFile } from "../controllers/fileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", checkPermission("file:upload"), upload.single("file"), uploadFile);
router.get("/", checkPermission("file:view"), getFiles);
router.delete("/:id", checkPermission("file:delete"), deleteFile);

export default router;
