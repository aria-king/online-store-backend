// controllers/productController.js
import Product from "../models/Product.js";

/* ================================
   📦 CRUD محصولات
================================ */

// دریافت همه محصولات
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error("❌ getProducts error:", err);
    res.status(500).json({ message: "خطا در دریافت محصولات" });
  }
};

// دریافت محصول با ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "محصول یافت نشد" });
    res.json(product);
  } catch (err) {
    console.error("❌ getProductById error:", err);
    res.status(500).json({ message: "خطا در دریافت محصول" });
  }
};

// ایجاد محصول جدید
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newProduct = new Product({ name, price, category, description, image });
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("❌ createProduct error:", err);
    res.status(500).json({ message: "خطا در ایجاد محصول" });
  }
};

// بروزرسانی محصول
export const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = `/uploads/${req.file.filename}`;

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!updated)
      return res.status(404).json({ message: "محصول یافت نشد" });
    res.json(updated);
  } catch (err) {
    console.error("❌ updateProduct error:", err);
    res.status(500).json({ message: "خطا در بروزرسانی محصول" });
  }
};

// حذف محصول
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "محصول یافت نشد" });
    res.json({ message: "محصول حذف شد" });
  } catch (err) {
    console.error("❌ deleteProduct error:", err);
    res.status(500).json({ message: "خطا در حذف محصول" });
  }
};

/* ================================
   💬 Review‌ها
================================ */

// افزودن نظر جدید
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "محصول یافت نشد" });

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "نظر ثبت شد" });
  } catch (err) {
    console.error("❌ addReview error:", err);
    res.status(500).json({ message: "خطا در افزودن نظر" });
  }
};

// دریافت نظرات محصول
export const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("reviews");
    if (!product)
      return res.status(404).json({ message: "محصول یافت نشد" });
    res.json(product.reviews);
  } catch (err) {
    console.error("❌ getProductReviews error:", err);
    res.status(500).json({ message: "خطا در دریافت نظرات" });
  }
};

// بروزرسانی وضعیت نظر (مثلاً تایید / رد)
export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;

    const product = await Product.findOne({ "reviews._id": reviewId });
    if (!product)
      return res.status(404).json({ message: "نظر یافت نشد" });

    const review = product.reviews.id(reviewId);
    review.status = status;
    await product.save();

    res.json({ message: "وضعیت نظر بروزرسانی شد" });
  } catch (err) {
    console.error("❌ updateReviewStatus error:", err);
    res.status(500).json({ message: "خطا در بروزرسانی وضعیت نظر" });
  }
};

/* ================================
   👍/👎 لایک‌ها
================================ */

// لایک محصول
export const likeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "محصول یافت نشد" });

    product.likes = (product.likes || 0) + 1;
    await product.save();
    res.json({ message: "محصول لایک شد" });
  } catch (err) {
    console.error("❌ likeProduct error:", err);
    res.status(500).json({ message: "خطا در لایک محصول" });
  }
};

// دیسلایک محصول
export const dislikeProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "محصول یافت نشد" });

    product.dislikes = (product.dislikes || 0) + 1;
    await product.save();
    res.json({ message: "محصول دیسلایک شد" });
  } catch (err) {
    console.error("❌ dislikeProduct error:", err);
    res.status(500).json({ message: "خطا در دیسلایک محصول" });
  }
};

// لایک روی نظر
export const likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const product = await Product.findOne({ "reviews._id": reviewId });
    if (!product)
      return res.status(404).json({ message: "نظر یافت نشد" });

    const review = product.reviews.id(reviewId);
    review.likes = (review.likes || 0) + 1;
    await product.save();

    res.json({ message: "نظر لایک شد" });
  } catch (err) {
    console.error("❌ likeReview error:", err);
    res.status(500).json({ message: "خطا در لایک نظر" });
  }
};
