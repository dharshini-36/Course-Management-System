const User = require("../models/User");

// GET /api/v1/profile   (any logged-in user - sees ONLY their own profile)
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.sub).select(
      "name email department role createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/profile   body: { name, department? }
// The user id comes from the JWT, so nobody can edit another person's profile.
async function updateProfile(req, res, next) {
  try {
    const { name, department } = req.body || {};

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Valid name is required" });
    }
    if (name.trim().length > 100) {
      return res.status(400).json({ message: "Name must be at most 100 characters" });
    }

    const updates = { name: name.trim() };

    if (department !== undefined) {
      if (typeof department !== "string" || department.trim().length > 100) {
        return res.status(400).json({ message: "Invalid department" });
      }
      updates.department = department.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.sub,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({
      message: "Profile updated",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile };