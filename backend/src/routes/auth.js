const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabase");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// ✅ RESEND SETUP
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// ======================
// Helper: Generate OTP
// ======================
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit
}

// ======================
// Middleware: verifyUser
// ======================
function verifyUser(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid token" });
  }
}

// ======================
// POST /register
// ======================
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(409).json({ success: false, error: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from("users")
      .insert([{ email, password_hash, name, is_verified: false }])
      .select()
      .single();

    if (error) throw error;

    // ✅ Generate OTP
    const otp = generateOTP();

    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from("otps").insert([
      { email, otp: otp.toString(), expires_at },
    ]);

    // ✅ SEND EMAIL
    await resend.emails.send({
      from: "CivicPulse <no-reply@civpulse.in>",
      to: email,
      subject: "Your OTP Code",
      html: `<h2>Your OTP is: ${otp}</h2>
             <p>This OTP expires in 10 minutes.</p>`,
    });

    return res.json({
      success: true,
      message: "OTP sent to your email",
      email,
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// POST /verify-otp
// ======================
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { data: otpData } = await supabase
      .from("otps")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!otpData) return res.status(400).json({ success: false, error: "OTP not found" });

    if (new Date(otpData.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: "OTP expired" });
    }

    if (otpData.otp !== otp.toString()) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    const { data: user } = await supabase
      .from("users")
      .update({ is_verified: true })
      .eq("email", email)
      .select()
      .single();

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// POST /login
// ======================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) return res.status(401).json({ success: false, error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, error: "Invalid credentials" });

    if (!user.is_verified) {
      return res.status(403).json({ success: false, error: "Please verify your email first" });
    }

    // ✅ Generate OTP
    const otp = generateOTP();

    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await supabase.from("otps").insert([
      { email, otp: otp.toString(), expires_at },
    ]);

    // ✅ SEND EMAILa
    await resend.emails.send({
      from: "CivicPulse <no-reply@civpulse.in>",
      to: email,
      subject: "Login OTP",
      html: `<h2>Your Login OTP is: ${otp}</h2>`,
    });

    return res.json({
      success: true,
      message: "OTP sent to your email",
      email,
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ======================
// POST /verify-login-otp
// ======================
router.post("/verify-login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const { data: otpData } = await supabase
      .from("otps")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!otpData) return res.status(400).json({ success: false, error: "OTP not found" });

    if (new Date(otpData.expires_at) < new Date()) {
      return res.status(400).json({ success: false, error: "OTP expired" });
    }

    if (otpData.otp !== otp.toString()) {
      return res.status(400).json({ success: false, error: "Invalid OTP" });
    }

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user,
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
  
// ======================
module.exports = router;