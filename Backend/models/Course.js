const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    instructor: { type: String, required: true, trim: true },
    level: { type: String, default: "" },
    weeks: { type: String, default: "" },
    hours: { type: String, default: "" },
    rating: { type: String, default: "" },
    topics: { type: String, default: "" },
    outcome: { type: String, default: "" },
  },
  {
    timestamps: true,
    // The React app reads course.id, so expose _id as "id".
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model("Course", courseSchema);
