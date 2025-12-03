import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
      required: true,
    },
    ctaButtonText: {
      type: String,
      required: true,
      default: "Learn More",
    },
    ctaButtonUrl: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quickly finding active ads
advertisementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

const Advertisement = mongoose.model("Advertisement", advertisementSchema);

export default Advertisement;
