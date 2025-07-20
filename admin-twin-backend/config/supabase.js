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
    // Simple connection test - just check if we can reach Supabase
    // We'll use a simple auth check which doesn't require any tables
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
      return false;
    } else {
      console.log("✅ Supabase connection successful");
      return true;
    }
  } catch (error) {
    console.error("❌ Supabase connection test failed:", error.message);
    return false;
  }
};

// Test connection on startup
testConnection();

module.exports = {
  supabase,
  supabaseAdmin,
};
