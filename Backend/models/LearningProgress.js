const mongoose = require("mongoose");

const learningProgressSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    completedLessons: { type: Number, default: 0, min: 0 },
    totalLessons: { type: Number, required: true, min: 1 },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    lastAccessedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

learningProgressSchema.index({ student: 1, course: 1 }, { unique: true });

// Recalculate the percentage before every save.
learningProgressSchema.pre("save", function () {
  if (this.completedLessons > this.totalLessons) {
    throw new Error("completedLessons cannot be greater than totalLessons");
  }
  this.progressPercentage = Math.round((this.completedLessons / this.totalLessons) * 100);
  this.lastAccessedAt = new Date();
});

module.exports = mongoose.model("LearningProgress", learningProgressSchema);
