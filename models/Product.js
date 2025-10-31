//models/Product.js
import mongoose from "mongoose";

// 🧩 اسکیمای نظر روی محصول
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, trim: true, maxlength: 1000 },
    rating: { type: Number, min: 1, max: 5, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// 🧩 اسکیمای محصول
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "نام محصول الزامی است"],
      trim: true,
      maxlength: 200,
    },
    description: { type: String, trim: true, maxlength: 2000 },

    // 💰 قیمت‌ها
    price: { type: Number, required: [true, "قیمت الزامی است"], min: 0 },
    purchasePrice: { type: Number, default: null },
    purchasePriceUSD: { type: Number, default: null },

    countInStock: {
      type: Number,
      required: [true, "تعداد موجودی الزامی است"],
      min: 0,
      default: 0,
    },

    // 📂 دسته‌بندی‌ها
    mainCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

    brand: { type: String, trim: true, maxlength: 100 },
    image: { type: String },
    images: [{ type: String }],

    // 💬 سیستم نظر و امتیاز
    reviews: [reviewSchema],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },

    // 👍 / 👎 سیستم لایک/دیس‌لایک
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    usersDisliked: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isActive: { type: Boolean, default: true },

    // 🧾 مشخصات گارانتی و کالا
    warrantyType: {
      type: String,
      enum: ["noWarranty", "originality", "health", "standard"],
      default: "noWarranty",
    },
    warrantyPeriod: { type: Number, default: 0 }, // ماه
    model: { type: String, trim: true, default: null },
    barcode: { type: String, trim: true, default: null },
    serialNumbers: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// 🔍 ایندکس برای جستجو
productSchema.index({ name: "text", description: "text" });

// 🧮 متد محاسبه امتیاز
productSchema.methods.updateRating = async function () {
  const approvedReviews = this.reviews.filter((r) => r.status === "approved");
  this.numReviews = approvedReviews.length;
  this.rating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((acc, r) => acc + r.rating, 0) /
        approvedReviews.length
      : 0;
  await this.save();
};

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
