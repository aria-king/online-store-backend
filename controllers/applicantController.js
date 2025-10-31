import Applicant from "../models/Applicant.js";
import Job from "../models/Job.js";
import { logAudit } from "../services/auditService.js";
import { createNotification } from "../services/notificationService.js";
import path from "path";

const normalizePath = (file) =>
  file ? `/uploads/${path.basename(file.path)}` : null;

/** 🧩 ارسال درخواست شغلی */
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "شغل مورد نظر یافت نشد" });

    const existing = await Applicant.findOne({ user: req.user._id, job: jobId });
    if (existing)
      return res.status(400).json({ message: "شما قبلاً برای این شغل درخواست داده‌اید" });

    const applicant = await Applicant.create({
      job: jobId,
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || "",
      coverLetter,
      resumeUrl: normalizePath(req.files?.resume?.[0]),
      idDocUrl: normalizePath(req.files?.idDoc?.[0]),
      criminalRecordUrl: normalizePath(req.files?.criminalRecord?.[0]),
      stage: "applied",
      status: "active",
    });

    await logAudit({
      entityType: "Applicant",
      entityId: applicant._id,
      action: "create",
      changedBy: req.user._id,
      from: null,
      to: applicant.toObject(),
      notes: "درخواست شغلی ارسال شد",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.status(201).json({ success: true, applicant });
  } catch (err) {
    console.error("❌ applyToJob error:", err);
    res.status(500).json({ message: "خطا در ثبت درخواست شغلی" });
  }
};

/** 📋 لیست متقاضیان برای یک شغل */
export const getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "شغل یافت نشد" });

    if (req.user.role !== "admin" && job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "دسترسی مجاز نیست" });

    const applicants = await Applicant.find({ job: jobId })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, applicants });
  } catch (err) {
    console.error("❌ getApplicantsForJob error:", err);
    res.status(500).json({ message: "خطا در دریافت لیست متقاضیان" });
  }
};

/** 🗑️ حذف متقاضی */
export const deleteApplicant = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const applicant = await Applicant.findById(applicantId).populate("job");
    if (!applicant) return res.status(404).json({ message: "متقاضی یافت نشد" });

    const job = applicant.job;
    if (req.user.role !== "admin" && job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "دسترسی مجاز نیست" });

    await logAudit({
      entityType: "Applicant",
      entityId: applicantId,
      action: "delete",
      changedBy: req.user._id,
      from: applicant.toObject(),
      to: null,
      notes: "متقاضی حذف شد",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    await applicant.deleteOne();

    res.json({ success: true, message: "متقاضی با موفقیت حذف شد" });
  } catch (err) {
    console.error("❌ deleteApplicant error:", err);
    res.status(500).json({ message: "خطا در حذف متقاضی" });
  }
};

/** 🔄 تغییر مرحله متقاضی */
export const updateApplicantStage = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { toStage, notes } = req.body;

    const applicant = await Applicant.findById(applicantId).populate("job");
    if (!applicant) return res.status(404).json({ message: "متقاضی یافت نشد" });

    const job = applicant.job;
    if (req.user.role !== "admin" && job.postedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "دسترسی مجاز نیست" });

    if (!job.stages.includes(toStage))
      return res.status(400).json({ message: "مرحله نامعتبر است" });

    const oldStage = applicant.stage;
    applicant.stage = toStage;
    await applicant.save();

    await logAudit({
      entityType: "Applicant",
      entityId: applicant._id,
      action: "stage_change",
      changedBy: req.user._id,
      from: oldStage,
      to: toStage,
      notes: notes || "Stage تغییر کرد",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    if (applicant.user) {
      await createNotification(
        applicant.user,
        "recruitment",
        `وضعیت درخواست شما برای ${job.title} تغییر کرد: ${toStage}`,
        { job: job._id, applicant: applicant._id, notes }
      );
    }

    res.json({ success: true, applicant });
  } catch (err) {
    console.error("❌ updateApplicantStage error:", err);
    res.status(500).json({ message: "خطا در بروزرسانی مرحله" });
  }
};
/**
 * 📄 دریافت جزئیات یک متقاضی
 */
export const getApplicantById = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const applicant = await Applicant.findById(applicantId)
      .populate("user", "name email phone")
      .populate("job", "title location");

    if (!applicant)
      return res.status(404).json({ message: "متقاضی یافت نشد" });

    res.json({ success: true, applicant });
  } catch (err) {
    console.error("❌ getApplicantById error:", err);
    res.status(500).json({ message: "خطا در دریافت اطلاعات متقاضی" });
  }
};

/**
 * 🔄 تغییر وضعیت متقاضی (active / withdrawn / rejected / hired)
 */
export const updateApplicantStatus = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const { toStatus, notes } = req.body;

    const applicant = await Applicant.findById(applicantId).populate("job");
    if (!applicant) return res.status(404).json({ message: "متقاضی یافت نشد" });

    const job = applicant.job;
    if (
      req.user.role !== "admin" &&
      job.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "دسترسی مجاز نیست" });
    }

    const oldStatus = applicant.status;
    applicant.status = toStatus;
    await applicant.save();

    await logAudit({
      entityType: "Applicant",
      entityId: applicant._id,
      action: "status_change",
      changedBy: req.user._id,
      from: oldStatus,
      to: toStatus,
      notes: notes || "وضعیت متقاضی تغییر کرد",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
    });

    res.json({ success: true, applicant });
  } catch (err) {
    console.error("❌ updateApplicantStatus error:", err);
    res.status(500).json({ message: "خطا در بروزرسانی وضعیت" });
  }
};

/**
 * 🕓 دریافت تاریخچه تغییرات متقاضی
 */
export const getApplicantHistory = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const applicant = await Applicant.findById(applicantId).select("history name email");

    if (!applicant)
      return res.status(404).json({ message: "متقاضی یافت نشد" });

    res.json({ success: true, history: applicant.history });
  } catch (err) {
    console.error("❌ getApplicantHistory error:", err);
    res.status(500).json({ message: "خطا در دریافت تاریخچه متقاضی" });
  }
};
