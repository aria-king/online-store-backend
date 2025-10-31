// controllers/roleController.js
import Role from "../models/Role.js";
import User from "../models/userModel.js";

import { logAudit, deepDiff } from "../services/auditService.js";

/* ===========================================================
   âœ… Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù‚Ø´ Ø¬Ø¯ÛŒØ¯
=========================================================== */
export const createRole = async (req, res) => {
  try {
    let { name, permissions = [], description = "" } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, message: "Ù†Ø§Ù… Ù†Ù‚Ø´ Ø§Ù„Ø²Ø§Ù…ÛŒ Ø§Ø³Øª." });
    }

    name = name.trim().toLowerCase();
    permissions = [...new Set(permissions.map((p) => p.trim().toLowerCase()))];

    const exists = await Role.findOne({ name });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Ø§ÛŒÙ† Ù†Ù‚Ø´ Ù‚Ø¨Ù„Ø§Ù‹ Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯Ù‡ Ø§Ø³Øª.",
      });
    }

    const createdBy = req.authContext?.user?._id || req.user?._id;
    const role = await Role.create({ name, permissions, description, createdBy });

    const clientInfo = req.authContext?.clientInfo || req.clientInfo;

    await logAudit({
      entityType: "Role",
      entityId: role._id,
      action: "create",
      changedBy: createdBy,
      to: role.toObject(),
      notes: `Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù‚Ø´ Ø¬Ø¯ÛŒØ¯ (${name})`,
      ip: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      meta: { permissionsCount: permissions.length },
    });

    res.status(201).json({
      success: true,
      message: "Ù†Ù‚Ø´ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø§ÛŒØ¬Ø§Ø¯ Ø´Ø¯.",
      data: role,
    });
  } catch (error) {
    console.error("âŒ [createRole] error:", error);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø§ÛŒØ¬Ø§Ø¯ Ù†Ù‚Ø´" });
  }
};

/* ===========================================================
   âœ… Ø¯Ø±ÛŒØ§ÙØª Ù†Ù‚Ø´â€ŒÙ‡Ø§ (Ø¨Ø§ ÙÛŒÙ„ØªØ±ØŒ Ø¬Ø³ØªØ¬ÙˆØŒ ØµÙØ­Ù‡â€ŒØ¨Ù†Ø¯ÛŒ)
=========================================================== */
export const getRoles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 100);
    const skip = (parseInt(page) - 1) * safeLimit;

    const filters = {};
    if (search) filters.name = { $regex: search, $options: "i" };
    if (req.query.isActive !== undefined)
      filters.isActive = req.query.isActive === "true";
    if (req.query.isSystem !== undefined)
      filters.isSystem = req.query.isSystem === "true";

    const [roles, total] = await Promise.all([
      Role.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Role.countDocuments(filters),
    ]);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / safeLimit),
      data: roles,
    });
  } catch (error) {
    console.error("âŒ [getRoles] error:", error);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù„ÛŒØ³Øª Ù†Ù‚Ø´â€ŒÙ‡Ø§" });
  }
};

/* ===========================================================
   âœ… Ø¯Ø±ÛŒØ§ÙØª Ø¬Ø²Ø¦ÛŒØ§Øª ÛŒÚ© Ù†Ù‚Ø´
=========================================================== */
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id).lean();
    if (!role) {
      return res.status(404).json({ success: false, message: "Ù†Ù‚Ø´ ÛŒØ§ÙØª Ù†Ø´Ø¯." });
    }

    res.json({ success: true, data: role });
  } catch (error) {
    console.error("âŒ [getRoleById] error:", error);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¯Ø±ÛŒØ§ÙØª Ù†Ù‚Ø´" });
  }
};

/* ===========================================================
   âœ… Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù†Ù‚Ø´ (Ø¨Ø§ Diff Ø¯Ù‚ÛŒÙ‚)
=========================================================== */
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, permissions, description } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Ù†Ù‚Ø´ ÛŒØ§ÙØª Ù†Ø´Ø¯." });
    }

    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: "Ù†Ù‚Ø´â€ŒÙ‡Ø§ÛŒ Ø³ÛŒØ³ØªÙ…ÛŒ Ù‚Ø§Ø¨Ù„ ÙˆÛŒØ±Ø§ÛŒØ´ Ù†ÛŒØ³ØªÙ†Ø¯.",
      });
    }

    const oldData = role.toObject();

    if (name && name !== role.name) {
      name = name.trim().toLowerCase();
      const exists = await Role.findOne({ name });
      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Ø§ÛŒÙ† Ù†Ø§Ù… Ù‚Ø¨Ù„Ø§Ù‹ Ø§Ø³ØªÙØ§Ø¯Ù‡ Ø´Ø¯Ù‡ Ø§Ø³Øª.",
        });
      }
      role.name = name;
    }

    if (permissions)
      role.permissions = [...new Set(permissions.map((p) => p.trim().toLowerCase()))];
    if (description !== undefined) role.description = description;

    const updated = await role.save();
    const changes = deepDiff(oldData, updated.toObject());

    const changedBy = req.authContext?.user?._id || req.user?._id;
    const clientInfo = req.authContext?.clientInfo || req.clientInfo;

    if (Object.keys(changes).length) {
      await logAudit({
        entityType: "Role",
        entityId: role._id,
        action: "update",
        changedBy,
        from: oldData,
        to: updated.toObject(),
        notes: `ÙˆÛŒØ±Ø§ÛŒØ´ Ù†Ù‚Ø´ (${role.name})`,
        ip: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
        meta: { changedFields: Object.keys(changes) },
      });
    }

    res.json({
      success: true,
      message: "Ù†Ù‚Ø´ Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ø´Ø¯.",
      data: updated,
    });
  } catch (error) {
    console.error("âŒ [updateRole] error:", error);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø¨Ø±ÙˆØ²Ø±Ø³Ø§Ù†ÛŒ Ù†Ù‚Ø´" });
  }
};

/* ===========================================================
   âœ… Ø­Ø°Ù Ù†Ù‚Ø´ (Ø¨Ø§ Ú©Ù†ØªØ±Ù„ ÙˆØ§Ø¨Ø³ØªÚ¯ÛŒ Ú©Ø§Ø±Ø¨Ø±Ø§Ù†)
=========================================================== */
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({ success: false, message: "Ù†Ù‚Ø´ ÛŒØ§ÙØª Ù†Ø´Ø¯." });
    }

    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: "Ù†Ù‚Ø´â€ŒÙ‡Ø§ÛŒ Ø³ÛŒØ³ØªÙ…ÛŒ Ù‚Ø§Ø¨Ù„ Ø­Ø°Ù Ù†ÛŒØ³ØªÙ†Ø¯.",
      });
    }

    const assignedUsers = await User.countDocuments({ roles: role._id });
    if (assignedUsers > 0) {
      return res.status(400).json({
        success: false,
        message: "Ø§ÛŒÙ† Ù†Ù‚Ø´ Ù‡Ù†ÙˆØ² Ø¨Ù‡ Ú©Ø§Ø±Ø¨Ø±Ø§Ù† Ø§Ø®ØªØµØ§Øµ Ø¯Ø§Ø±Ø¯ Ùˆ Ù‚Ø§Ø¨Ù„ Ø­Ø°Ù Ù†ÛŒØ³Øª.",
      });
    }

    const oldData = role.toObject();
    await role.deleteOne();

    const changedBy = req.authContext?.user?._id || req.user?._id;
    const clientInfo = req.authContext?.clientInfo || req.clientInfo;

    await logAudit({
      entityType: "Role",
      entityId: id,
      action: "delete",
      changedBy,
      from: oldData,
      to: null,
      notes: `Ø­Ø°Ù Ù†Ù‚Ø´ (${oldData.name})`,
      ip: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      meta: { deletedAt: new Date().toISOString() },
    });

    res.json({
      success: true,
      message: `Ù†Ù‚Ø´ "${oldData.name}" Ø¨Ø§ Ù…ÙˆÙÙ‚ÛŒØª Ø­Ø°Ù Ø´Ø¯.`,
    });
  } catch (error) {
    console.error("âŒ [deleteRole] error:", error);
    res.status(500).json({ success: false, message: "Ø®Ø·Ø§ Ø¯Ø± Ø­Ø°Ù Ù†Ù‚Ø´" });
  }
};
