const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://xcqqscpyiozoezpgylak.supabase.co";
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjcXFzY3B5aW96b2V6cGd5bGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NjU5NTEsImV4cCI6MjA5MjM0MTk1MX0.emuKxv906NTSG9tR-Ey4Npj8CHnB1VF-Y9l2XK6TJHk"
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;