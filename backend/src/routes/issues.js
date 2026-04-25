const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");
const multer = require("multer");
const axios = require("axios");

const AI_URL = process.env.AI_API_URL;

// Debug middleware: log all incoming requests to this router
router.use((req, res, next) => {
  console.log("Incoming:", req.method, req.originalUrl);
  next();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"), false);
    }
    cb(null, true);
  }, 
});

function generateTicketId() {
  return `TKT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
console.log("🔥 issues route loaded");

// ----------------------
// SPECIFIC ROUTES FIRST
// ----------------------


// /track/:ticket_id
router.get("/track/:ticket_id", async (req, res) => {
  try {
    const result = await supabase
      .from("issues")
      .select("*")
      .eq("ticket_id", req.params.ticket_id)
      .maybeSingle();

    if (result.error || !result.data) {
      return res.status(404).json({ success: false });
    }

    return res.json({ success: true, issue: result.data });
  } catch {
    return res.status(500).json({ success: false });
  }
});

// /user
router.get("/user", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, error: "Missing email" });
    }
    const result = await supabase
      .from("issues")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (result.error) {
      return res.status(500).json({ success: false, error: result.error.message });
    }

    return res.json({ success: true, issues: result.data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------
// GENERIC '/' AND CREATE ISSUE LAST
// ----------------------------------

// 🚀 CREATE ISSUE
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { description, latitude, longitude, category, email } = req.body;

    if (!description || !latitude || !longitude || !email) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const ticket_id = generateTicketId();

    // 🟢 IMAGE UPLOAD
    let photo_url = null;
    if (req.file) {
      const cleanName = req.file.originalname
        .replace(/\s+/g, "_")
        .replace(/[^\w.-]/g, "");
      const fileName = `${Date.now()}-${cleanName}`;

      const uploadResult = await supabase.storage
        .from("issues")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (!uploadResult.error) {
        const { data } = supabase.storage.from("issues").getPublicUrl(fileName);
        photo_url = data.publicUrl;
      }
    }

    // 🟢 AI CLASSIFICATION
    let ai_category = category || "other";
    let confidence = 0;

    if (photo_url) {
      try {
        const aiRes = await axios.post(`${AI_URL}/classify`, {
          image_url: photo_url,
        });
        if (aiRes && aiRes.data) {
          ai_category = aiRes.data.category || ai_category;
          confidence = aiRes.data.confidence || 0;
        }
      } catch (err) {
        console.error("AI ERROR:", err.message);
      }
    }

    let department = "general";

    if (ai_category.includes("pothole")) department = "roads";
    else if (ai_category.includes("garbage")) department = "sanitation";
    else if (ai_category.includes("water")) department = "water";
    else if (ai_category.includes("streetlight")) department = "electricity";
    // 🟢 SEVERITY
    let severity = 0;
    const cat = (ai_category || "").toLowerCase();
    const desc = (description || "").toLowerCase();
    if (cat.includes("water")) severity += 6;
    else if (cat.includes("pothole")) severity += 5;
    else if (cat.includes("garbage")) severity += 4;
    else if (cat.includes("streetlight")) severity += 3;
    else severity += 2;
    severity += Math.round(confidence * 3);
    if (desc.includes("huge") || desc.includes("serious")) severity += 2;
    if (desc.includes("danger") || desc.includes("accident")) severity += 3;
    if (desc.includes("flood") || desc.includes("emergency")) severity += 4;
    severity = Math.max(1, Math.min(10, severity));

    // 🟢 DUPLICATE CHECK (ACCURATE)
    let isDuplicate = false;
    let nearbyResult = await supabase
      .from("issues")
      .select("latitude,longitude")
      .limit(50);

    if (nearbyResult && nearbyResult.data) {
      for (let issue of nearbyResult.data) {
        if (
          issue.latitude !== undefined &&
          issue.longitude !== undefined
        ) {
          const distance = getDistance(
            issue.latitude,
            issue.longitude,
            lat,
            lng
          );
          if (distance < 0.5) {
            isDuplicate = true;
            break;
          }
        }
      }
    }

    // 🟢 SAVE
    const saveResult = await supabase
      .from("issues")
      .insert([
        {
          email,
          ticket_id,
          category: ai_category,
          confidence,
          description,
          latitude: lat,
          longitude: lng,
          photo_url,
          status: "pending",
          severity,
          is_duplicate: isDuplicate,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          department:department,
        },
      ])
      .select()
      .single();

    if (saveResult.error) {
      return res
        .status(500)
        .json({ success: false, error: saveResult.error.message });
    }

    return res.json({
      success: true,
      ticket_id,
      issue: saveResult.data,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: err.message });
  }
});

// 🌍 PUBLIC - GET ALL ISSUES
router.get("/", async (req, res) => {
  try {
    const result = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error.message,
      });
    }

    return res.json({
      success: true,
      issues: result.data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;