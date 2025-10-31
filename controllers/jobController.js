import Job from "../models/Job.js";
import { logAudit } from "../services/auditService.js";

// ✅ ایجاد شغل جدید
export const createJob = async (req, res) => {
  try {
    const job = new Job({
      title: req.body.title,
      description: req.body.description,
      company: req.body.company,
      location: req.body.location,
      salary: req.body.salary,
      stages: req.body.stages?.length ? req.body.stages : undefined,
      postedBy: req.user._id,
    });

    const savedJob = await job.save();

    await logAudit({
      entityType: "Job",
      entityId: savedJob._id,
      action: "create",
      changedBy: req.user._id,
      from: null,
      to: savedJob.toObject(),
      notes: "شغل جدید ایجاد شد",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { jobId: savedJob._id },
    });

    res.status(201).json(savedJob);
  } catch (err) {
    console.error("❌ createJob error:", err);
    res.status(500).json({ message: "خطا در ایجاد شغل" });
  }
};

// ✅ بروزرسانی شغل
export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "شغل یافت نشد" });

    if (req.user.role !== "admin" && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "دسترسی ندارید" });
    }

    const oldJob = job.toObject();

    job.title = req.body.title || job.title;
    job.description = req.body.description || job.description;
    job.company = req.body.company || job.company;
    job.location = req.body.location || job.location;
    job.salary = req.body.salary || job.salary;
    if (req.body.stages) job.stages = req.body.stages;

    const updatedJob = await job.save();

    await logAudit({
      entityType: "Job",
      entityId: updatedJob._id,
      action: "update",
      changedBy: req.user._id,
      from: oldJob,
      to: updatedJob.toObject(),
      notes: "شغل بروزرسانی شد",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { jobId: updatedJob._id },
    });

    res.json(updatedJob);
  } catch (err) {
    console.error("❌ updateJob error:", err);
    res.status(500).json({ message: "خطا در بروزرسانی شغل" });
  }
};

// ✅ حذف شغل
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: "شغل یافت نشد" });

    if (req.user.role !== "admin" && job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "دسترسی ندارید" });
    }

    const oldJob = job.toObject();
    await job.deleteOne();

    await logAudit({
      entityType: "Job",
      entityId: id,
      action: "delete",
      changedBy: req.user._id,
      from: oldJob,
      to: null,
      notes: "شغل حذف شد",
      ip: req.clientInfo?.ip,
      userAgent: req.clientInfo?.userAgent,
      meta: { jobId: id },
    });

    res.json({ message: "شغل حذف شد" });
  } catch (err) {
    console.error("❌ deleteJob error:", err);
    res.status(500).json({ message: "خطا در حذف شغل" });
  }
};

// ✅ دریافت همه شغل‌ها
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate("postedBy", "name email");
    res.json(jobs);
  } catch (err) {
    console.error("❌ getJobs error:", err);
    res.status(500).json({ message: "خطا در دریافت لیست شغل‌ها" });
  }
};

// ✅ دریافت جزئیات یک شغل
export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("postedBy", "name email");
    if (!job) return res.status(404).json({ message: "شغل یافت نشد" });
    res.json(job);
  } catch (err) {
    console.error("❌ getJobById error:", err);
    res.status(500).json({ message: "خطا در دریافت اطلاعات شغل" });
  }
};
