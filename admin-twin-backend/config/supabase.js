const { createClient } = require("@supabase/supabase-js");

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error("❌ SUPABASE_URL is required");
  process.exit(1);
}

if (!process.env.SUPABASE_ANON_KEY) {
  console.error("❌ SUPABASE_ANON_KEY is required");
  process.exit(1);
}

// Create Supabase client for general operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false, // Server-side, don't persist sessions
    },
    db: {
      schema: "public",
    },
    global: {
      headers: {
        "x-application-name": "replygenius-backend",
      },
    },
  }
);

// Create Supabase admin client for admin operations (if service role key is provided)
let supabaseAdmin = null;
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      db: {
        schema: "public",
      },
    }
  );
  console.log("✅ Supabase Admin client initialized");
} else {
  console.log(
    "⚠️  Supabase Service Role key not provided - admin operations disabled"
  );
}

// Test connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("_health_check")
      .select("*")
      .limit(1);
    if (error && error.code !== "PGRST116") {
      // PGRST116 = table not found (expected)
      console.error("❌ Supabase connection failed:", error.message);
    } else {
      console.log("✅ Supabase connection successful");
    }
  } catch (error) {
    console.error("❌ Supabase connection test failed:", error.message);
  }
};

// Test connection on startup
testConnection();

module.exports = {
  supabase,
  supabaseAdmin,
};
