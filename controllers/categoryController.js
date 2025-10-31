//controllers/categoryController.js
import Category from "../models/Category.js";
import Product from "../models/Product.js";

/* ================================
   ðŸ“Œ Ú¯Ø±ÙØªÙ† Ù‡Ù…Ù‡ Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§ (Ø¨Ø§ Ø¬Ø³ØªØ¬Ùˆ Ùˆ ÙÛŒÙ„ØªØ±)
================================ */
export const getCategories = async (req, res) => {
  try {
    const { activeOnly = false, search = "" } = req.query;

    let filter = {};
    if (activeOnly === "true") filter.isActive = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const categories = await Category.find(filter).populate("parent", "name");

    res.json(categories);
  } catch (error) {
    console.error("âŒ getCategories error:", error);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

/* ================================
   ðŸ“Œ Ú¯Ø±ÙØªÙ† ÛŒÚ© Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ
================================ */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "parent",
      "name"
    );
    if (!category) return res.status(404).json({ message: "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    res.json(category);
  } catch (error) {
    console.error("âŒ getCategoryById error:", error);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

/* ================================
   ðŸ“Œ Ø³Ø§Ø®Øª Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ
================================ */
export const createCategory = async (req, res) => {
  try {
    const { name, description, parent } = req.body;

    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: "Ø¯Ø³ØªÙ‡ ÙˆØ§Ù„Ø¯ Ù…Ø¹ØªØ¨Ø± Ù†ÛŒØ³Øª" });
      }
    }

    const category = new Category({ name, description, parent });
    await category.save();

    res.status(201).json({ message: "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯", category });
  } catch (error) {
    console.error("âŒ createCategory error:", error);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

/* ================================
   ðŸ“Œ ÙˆÛŒØ±Ø§ÛŒØ´ Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ
================================ */
export const updateCategory = async (req, res) => {
  try {
    const { name, description, parent, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(404).json({ message: "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // âŒ Ø¬Ù„ÙˆÚ¯ÛŒØ±ÛŒ Ø§Ø² Ø§Ù†ØªØ®Ø§Ø¨ Ø®ÙˆØ¯Ø´ Ø¨Ø¹Ù†ÙˆØ§Ù† ÙˆØ§Ù„Ø¯
    if (parent && parent.toString() === category._id.toString()) {
      return res
        .status(400)
        .json({ message: "ÛŒÚ© Ø¯Ø³ØªÙ‡ Ù†Ù…ÛŒâ€ŒØªÙˆØ§Ù†Ø¯ ÙˆØ§Ù„Ø¯ Ø®ÙˆØ¯Ø´ Ø¨Ø§Ø´Ø¯" });
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (parent !== undefined) category.parent = parent || null;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({ message: "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯", category });
  } catch (error) {
    console.error("âŒ updateCategory error:", error);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

/* ================================
   ðŸ“Œ Ø­Ø°Ù Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ
================================ */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ ÛŒØ§ÙØª Ù†Ø´Ø¯" });

    // ðŸš¨ Ø¨Ø±Ø±Ø³ÛŒ ÙˆØ¬ÙˆØ¯ Ø²ÛŒØ±â€ŒØ¯Ø³ØªÙ‡
    const subCategory = await Category.findOne({ parent: category._id });
    if (subCategory) {
      return res
        .status(400)
        .json({ message: "Ø§Ø¨ØªØ¯Ø§ Ø²ÛŒØ±â€ŒØ¯Ø³ØªÙ‡â€ŒÙ‡Ø§ÛŒ Ø§ÛŒÙ† Ø¯Ø³ØªÙ‡ Ø±Ø§ Ø­Ø°Ù Ú©Ù†ÛŒØ¯" });
    }

    // ðŸš¨ Ø¨Ø±Ø±Ø³ÛŒ ÙˆØ¬ÙˆØ¯ Ù…Ø­ØµÙˆÙ„ Ø¯Ø± Ø§ÛŒÙ† Ø¯Ø³ØªÙ‡
    const product = await Product.findOne({ mainCategory: category._id });
    if (product) {
      return res
        .status(400)
        .json({ message: "Ø§Ø¨ØªØ¯Ø§ Ù…Ø­ØµÙˆÙ„Ø§Øª Ù…Ø±ØªØ¨Ø· Ø¨Ø§ Ø§ÛŒÙ† Ø¯Ø³ØªÙ‡ Ø±Ø§ ÙˆÛŒØ±Ø§ÛŒØ´ Ú©Ù†ÛŒØ¯" });
    }

    await category.deleteOne();
    res.json({ message: "Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒ Ø­Ø°Ù Ø´Ø¯" });
  } catch (error) {
    console.error("âŒ deleteCategory error:", error);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};

/* ================================
   ðŸ“Œ Ú¯Ø±ÙØªÙ† Ø¯Ø³ØªÙ‡â€ŒØ¨Ù†Ø¯ÛŒâ€ŒÙ‡Ø§ Ø¨Ù‡ Ø´Ú©Ù„ Ø¯Ø±Ø®Øª
================================ */
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find();

    const buildTree = (parentId = null) => {
      return categories
        .filter((cat) =>
          parentId ? cat.parent?.toString() === parentId.toString() : !cat.parent
        )
        .map((cat) => ({
          _id: cat._id,
          name: cat.name,
          description: cat.description,
          isActive: cat.isActive,
          children: buildTree(cat._id),
        }));
    };

    res.json(buildTree());
  } catch (error) {
    console.error("âŒ getCategoryTree error:", error);
    res.status(500).json({ message: "Ø®Ø·Ø§ÛŒ Ø³Ø±ÙˆØ±" });
  }
};
