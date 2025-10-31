import Product from "../models/Product.js";

// ðŸ“Œ Ø«Ø¨Øª Ù†Ø¸Ø±
export const createComment = async (req, res) => {
  try {
    const { productId, text, rating } = req.body;
    const userId = req.user._id;

    if (!productId || !text || !rating) {
      return res.status(400).json({ message: "Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù†Ø§Ù‚Øµ Ø§Ø³Øª" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Ù…Ø­ØµÙˆÙ„ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯" });

    const review = { user: userId, text, rating };
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Ù†Ø¸Ø± Ø«Ø¨Øª Ø´Ø¯ Ùˆ Ø¯Ø± Ø§Ù†ØªØ¸Ø§Ø± ØªØ§ÛŒÛŒØ¯ Ø§Ø³Øª", review });
  } catch (error) {
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

// ðŸ“Œ Ø¯Ø±ÛŒØ§ÙØª Ù†Ø¸Ø±Ù‡Ø§ÛŒ ØªØ§ÛŒÛŒØ¯Ø´Ø¯Ù‡ ÛŒÚ© Ù…Ø­ØµÙˆÙ„
export const getProductComments = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate("reviews.user", "name lastName");

    if (!product) return res.status(404).json({ message: "Ù…Ø­ØµÙˆÙ„ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯" });

    const approvedReviews = product.reviews.filter(r => r.status === "approved");
    res.json(approvedReviews);
  } catch (error) {
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

// ðŸ“Œ ØªØºÛŒÛŒØ± ÙˆØ¶Ø¹ÛŒØª Ù†Ø¸Ø± (ÙÙ‚Ø· Ø§Ø¯Ù…ÛŒÙ†)
export const updateCommentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Ù…Ø­ØµÙˆÙ„ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Ù†Ø¸Ø± Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯" });

    review.status = status;
    await product.save();

    res.json({ message: "ÙˆØ¶Ø¹ÛŒØª Ù†Ø¸Ø± ØªØºÛŒÛŒØ± Ú©Ø±Ø¯", review });
  } catch (error) {
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

// ðŸ“Œ Ù„Ø§ÛŒÚ© Ù†Ø¸Ø±
export const likeComment = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Ù…Ø­ØµÙˆÙ„ Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Ù†Ø¸Ø± Ù¾ÛŒØ¯Ø§ Ù†Ø´Ø¯" });

    if (review.likes.includes(userId)) {
      review.likes = review.likes.filter(id => id.toString() !== userId.toString());
    } else {
      review.likes.push(userId);
    }

    await product.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};
