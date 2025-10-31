// models/Ticket.js
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    customer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },

    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },

    relatedWarranty: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Warranty", 
      default: null 
    },

    issueDescription: { 
      type: String, 
      required: true, 
      trim: true 
    },

    status: { 
      type: String, 
      enum: [
        "open",
        "scheduled",
        "in_progress",
        "waiting_for_parts",
        "awaiting_customer",
        "completed",
        "canceled"
      ], 
      default: "open" 
    },

    assignedTechnicians: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },

    serviceHistories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceHistory" }
    ],

    location: {
      province: { type: String },
      city: { type: String },
      district: { type: String },
      address: { type: String },
    },

    statusHistory: [
      {
        status: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Ticket = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
export default Ticket;
