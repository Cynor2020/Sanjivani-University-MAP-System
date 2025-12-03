import Advertisement from "../models/Advertisement.js";

// Create a new advertisement
export const createAdvertisement = async (req, res) => {
  try {
    const { title, description, bannerUrl, ctaButtonText, ctaButtonUrl, startDate, endDate } = req.body;

    // Validate required fields
    if (!title || !description || !bannerUrl || !ctaButtonText || !ctaButtonUrl || !startDate || !endDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    // Create advertisement
    const advertisement = await Advertisement.create({
      title,
      description,
      bannerUrl,
      ctaButtonText,
      ctaButtonUrl,
      startDate: start,
      endDate: end,
      isActive: true,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Advertisement created successfully",
      advertisement,
    });
  } catch (error) {
    console.error("Error creating advertisement:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get active advertisement for students
export const getActiveAdvertisement = async (req, res) => {
  try {
    const now = new Date();

    // Find active advertisement within date range
    const advertisement = await Advertisement.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    if (!advertisement) {
      return res.json({ advertisement: null });
    }

    res.json({ advertisement });
  } catch (error) {
    console.error("Error fetching active advertisement:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all advertisements (for director)
export const getAllAdvertisements = async (req, res) => {
  try {
    const advertisements = await Advertisement.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    res.json({ advertisements });
  } catch (error) {
    console.error("Error fetching advertisements:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get single advertisement by ID
export const getAdvertisementById = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id)
      .populate("createdBy", "name email")
      .lean();

    if (!advertisement) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    res.json({ advertisement });
  } catch (error) {
    console.error("Error fetching advertisement:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update advertisement
export const updateAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, bannerUrl, ctaButtonText, ctaButtonUrl, startDate, endDate, isActive } = req.body;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start >= end) {
        return res.status(400).json({ error: "End date must be after start date" });
      }
    }

    // Update fields
    if (title) advertisement.title = title;
    if (description) advertisement.description = description;
    if (bannerUrl) advertisement.bannerUrl = bannerUrl;
    if (ctaButtonText) advertisement.ctaButtonText = ctaButtonText;
    if (ctaButtonUrl) advertisement.ctaButtonUrl = ctaButtonUrl;
    if (startDate) advertisement.startDate = new Date(startDate);
    if (endDate) advertisement.endDate = new Date(endDate);
    if (typeof isActive === "boolean") advertisement.isActive = isActive;

    await advertisement.save();

    res.json({
      message: "Advertisement updated successfully",
      advertisement,
    });
  } catch (error) {
    console.error("Error updating advertisement:", error);
    res.status(500).json({ error: error.message });
  }
};

// Toggle advertisement active status
export const toggleAdvertisementStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    advertisement.isActive = !advertisement.isActive;
    await advertisement.save();

    res.json({
      message: `Advertisement ${advertisement.isActive ? "activated" : "deactivated"} successfully`,
      advertisement,
    });
  } catch (error) {
    console.error("Error toggling advertisement status:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete advertisement
export const deleteAdvertisement = async (req, res) => {
  try {
    const { id } = req.params;

    const advertisement = await Advertisement.findById(id);

    if (!advertisement) {
      return res.status(404).json({ error: "Advertisement not found" });
    }

    await advertisement.deleteOne();

    res.json({ message: "Advertisement deleted successfully" });
  } catch (error) {
    console.error("Error deleting advertisement:", error);
    res.status(500).json({ error: error.message });
  }
};
