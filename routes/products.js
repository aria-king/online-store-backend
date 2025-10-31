// routes/products.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getProductReviews,
  updateReviewStatus,
  likeProduct,
  dislikeProduct,
  likeReview,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================================
   📁 تنظیمات آپلود فایل (تصویر محصول)
================================ */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("فقط فرمت‌های تصویری مجاز هستند"));
};

const upload = multer({ storage, fileFilter });

/* ================================
   📦 مدیریت محصولات
================================ */
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, upload.single("image"), createProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

/* ================================
   💬 مدیریت نظرات (Reviews)
================================ */
router.post("/:id/reviews", protect, addReview);
router.get("/:id/reviews", getProductReviews);
router.put(
  "/:id/reviews/:reviewId/status",
  protect,
  adminOnly,
  updateReviewStatus
);
router.post("/:id/reviews/:reviewId/like", protect, likeReview);

/* ================================
   👍/👎 لایک و دیسلایک محصول
================================ */
router.post("/:id/like", protect, likeProduct);
router.post("/:id/dislike", protect, dislikeProduct);

export default router;
