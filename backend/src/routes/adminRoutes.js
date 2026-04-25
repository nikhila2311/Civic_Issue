const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../config/supabase')
const { verifyAdmin } = require('../middleware/auth')
const multer = require("multer");
const router = express.Router()
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /login
router.post('/login', async (req, res) => {
  
  try {
    const { email, password } = req.body

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()
  
    if (error || !admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }
    
    const isMatch = await bcrypt.compare(password, admin.password_hash)
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        department: (admin.department || '').trim().toLowerCase(),
        role:admin.role // 🔥 ADD THIS LINE
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    return res.json({ success: true, token })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

// GET /issues (protected)
  router.get('/issues', verifyAdmin, async (req, res) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }
  
  
    try {
      const { status, category } = req.query;
  
      const dept = (req.admin?.department || '').trim().toLowerCase();
      const role = req.admin?.role;
  
      let query = supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
  
      // 🔥 KEY LOGIC
      if (role !== 'super_admin') {
        query = query.eq('department', dept);
      }
  
      if (status) query = query.eq('status', status);
      if (category) query = query.eq('category', category);
  
    
      const { data, error } = await query;
  
  
  
      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
  
      return res.json({ success: true, issues: data, count: data.length });
  
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });


// PATCH /issues/:id/status (protected)

// ✅ Add this at top (below imports)
// PATCH /issues/:id/status (protected + image support)
router.patch(
  '/issues/:id/status',
  verifyAdmin,
  upload.single("afterImage"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
      }

      // 🟢 Get current status
      const { data: current } = await supabase
        .from('issues')
        .select('status')
        .eq('id', id)
        .limit(1)
        .single()

      let after_image_url = null;

      // 🟢 Upload AFTER image if provided
      if (req.file) {
        const cleanName = req.file.originalname
          .replace(/\s+/g, "_")
          .replace(/[^\w.-]/g, "");

        const fileName = `after-${Date.now()}-${cleanName}`;

        const { error: uploadError } = await supabase
          .storage
          .from("issues")
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false
          });

        if (!uploadError) {
          const { data } = supabase
            .storage
            .from("issues")
            .getPublicUrl(fileName);

          after_image_url = data.publicUrl;
        } else {
          console.error("AFTER IMAGE UPLOAD ERROR:", uploadError.message);
        }
      }

      // 🟢 Prepare update object
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (after_image_url) {
        updateData.after_image_url = after_image_url;
      }

      // 🟢 Update DB
      const { data, error } = await supabase
        .from('issues')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ success: false, error: error.message });
      }
      try {
        const issue = data;
        console.log("📌 ISSUE DATA:", issue);
        console.log("📤 Sending email to:", issue.email);
        if (issue?.email) {
          await resend.emails.send({
            from: "CivicPulse <no-reply@civpulse.in>",
            to: issue.email,
            subject: `Update on your issue (${issue.ticket_id})`,
            html: `
              <div style="font-family: Arial; padding: 20px;">
                <h2>CivicPulse Update</h2>
                <p>Your reported issue has been updated.</p>

                <p><strong>Ticket ID:</strong> ${issue.ticket_id}</p>
                <p><strong>Status:</strong> ${status.replace('_', ' ')}</p>

                <p>${issue.description}</p>

                ${
                  status === "resolved"
                    ? "<p style='color: green;'>✅ Your issue has been resolved.</p>"
                    : status === "in_progress"
                    ? "<p style='color: blue;'>🔄 Your issue is being worked on.</p>"
                    : ""
                }
                 ${
                  issue.after_image_url
                      ? `
                        <p><strong>Updated Image:</strong></p>
                        <img src="${issue.after_image_url}" 
                            style="max-width: 100%; border-radius: 8px;" />
                        <p>
                          <a href="${issue.after_image_url}" target="_blank">
                            View Full Image
                          </a>
                        </p>
                      `
                      : ""
                  }
                <p>Thank you for using CivicPulse.</p>
              </div>
            `
          });
      
          console.log("Email sent:", issue.email);
        }
      } catch (err) {
        console.error("Email failed:", err.message);
      }
      // 🟢 Save history (unchanged logic)
      await supabase.from('status_history').insert([{
        issue_id: id,
        old_status: current?.status,
        new_status: status
      }]);

      return res.json({ success: true, issue: data });

    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);
// GET /analytics
router.get('/analytics', verifyAdmin, async (req, res) => {
  try {
    const { data: all } = await supabase.from('issues').select('status, created_at, updated_at')

    const total       = all?.length || 0
    const pending     = all?.filter(i => i.status === 'pending').length || 0
    const in_progress = all?.filter(i => i.status === 'in_progress').length || 0
    const resolved    = all?.filter(i => i.status === 'resolved').length || 0

    const resolvedIssues = all?.filter(i => i.status === 'resolved' && i.updated_at)
    const avgHours = resolvedIssues?.length
      ? Math.round(resolvedIssues.reduce((sum, i) => {
          return sum + (new Date(i.updated_at) - new Date(i.created_at)) / 3600000
        }, 0) / resolvedIssues.length)
      : 0

    return res.json({ success: true, total, pending, in_progress, resolved, avgHours })
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router