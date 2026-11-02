const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    rollNo: { type: String, trim: true, default: "" },
    // "withdrawn" keeps the enrollment history instead of deleting it.
    status: {
      type: String,
      enum: ["active", "completed", "withdrawn"],
      default: "active"
    },
    enrolledAt: { type: Date, default: Date.now },
    certificateId: { type: String, default: "" }
  },
  { timestamps: true }
);

// A student can have only ONE enrollment record per course.
// (Re-enrolling reactivates the withdrawn record - see enrollmentController.)
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);