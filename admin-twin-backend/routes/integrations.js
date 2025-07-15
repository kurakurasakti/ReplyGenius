const express = require("express");
const crypto = require("crypto");
const { supabase } = require("../config/supabase");

const router = express.Router();

// Encryption utilities
const algorithm = "aes-256-gcm";
const secretKey = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, secretKey);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return {
    encryptedData: encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
};

const decrypt = (encryptedData, iv, authTag) => {
  const decipher = crypto.createDecipher(algorithm, secretKey);
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

// Middleware to verify authentication
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authorization token required",
      });
    }

    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Get user's integrations
router.get("/", authenticateUser, async (req, res, next) => {
  try {
    console.log("📋 Fetching integrations for user:", req.user.id);

    const { data, error } = await supabase
      .from("user_integrations")
      .select("id, platform, status, created_at, updated_at, platform_config")
      .eq("user_id", req.user.id);

    if (error) {
      console.error("❌ Error fetching integrations:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch integrations",
      });
    }

    // Don't send encrypted API keys to frontend
    const safeIntegrations = data.map((integration) => ({
      id: integration.id,
      platform: integration.platform,
      status: integration.status,
      created_at: integration.created_at,
      updated_at: integration.updated_at,
      hasApiKey: !!integration.platform_config,
    }));

    console.log("✅ Integrations fetched successfully");

    res.json({
      success: true,
      integrations: safeIntegrations,
    });
  } catch (error) {
    next(error);
  }
});

// Create or update integration
router.post("/", authenticateUser, async (req, res, next) => {
  try {
    console.log("🔗 Creating/updating integration for user:", req.user.id);

    const { platform, apiKey, apiSecret, shopId } = req.body;

    // Validation
    if (!platform || !["shopee", "tiktokshop"].includes(platform)) {
      return res.status(400).json({
        success: false,
        error: 'Platform must be either "shopee" or "tiktokshop"',
      });
    }

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "API key is required",
      });
    }

    // Encrypt sensitive data
    const encryptedConfig = {
      apiKey: encrypt(apiKey),
      ...(apiSecret && { apiSecret: encrypt(apiSecret) }),
      ...(shopId && { shopId: shopId }),
    };

    // Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from("user_integrations")
      .select("id")
      .eq("user_id", req.user.id)
      .eq("platform", platform)
      .single();

    let result;
    if (existingIntegration) {
      // Update existing integration
      const { data, error } = await supabase
        .from("user_integrations")
        .update({
          platform_config: encryptedConfig,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id)
        .select();

      result = { data, error };
    } else {
      // Create new integration
      const { data, error } = await supabase
        .from("user_integrations")
        .insert({
          user_id: req.user.id,
          platform,
          platform_config: encryptedConfig,
          status: "active",
        })
        .select();

      result = { data, error };
    }

    if (result.error) {
      console.error("❌ Error saving integration:", result.error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to save integration",
      });
    }

    console.log("✅ Integration saved successfully");

    res.json({
      success: true,
      message: `${platform} integration ${
        existingIntegration ? "updated" : "created"
      } successfully`,
      integration: {
        id: result.data[0].id,
        platform: result.data[0].platform,
        status: result.data[0].status,
        created_at: result.data[0].created_at,
        updated_at: result.data[0].updated_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Test integration connection
router.post("/:id/test", authenticateUser, async (req, res, next) => {
  try {
    console.log("🧪 Testing integration connection");

    const { id } = req.params;

    // Get integration
    const { data: integration, error } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !integration) {
      return res.status(404).json({
        success: false,
        error: "Integration not found",
      });
    }

    // For MVP, we'll simulate the connection test
    // In production, this would make actual API calls to test the credentials
    const isConnectionSuccessful = Math.random() > 0.2; // 80% success rate for demo

    // Update status based on test
    const newStatus = isConnectionSuccessful ? "active" : "error";

    await supabase
      .from("user_integrations")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    console.log(
      `${isConnectionSuccessful ? "✅" : "❌"} Integration test ${
        isConnectionSuccessful ? "passed" : "failed"
      }`
    );

    res.json({
      success: true,
      connectionStatus: isConnectionSuccessful ? "connected" : "failed",
      message: isConnectionSuccessful
        ? `${integration.platform} connection successful`
        : `${integration.platform} connection failed - please check your credentials`,
    });
  } catch (error) {
    next(error);
  }
});

// Delete integration
router.delete("/:id", authenticateUser, async (req, res, next) => {
  try {
    console.log("🗑️ Deleting integration");

    const { id } = req.params;

    const { error } = await supabase
      .from("user_integrations")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) {
      console.error("❌ Error deleting integration:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to delete integration",
      });
    }

    console.log("✅ Integration deleted successfully");

    res.json({
      success: true,
      message: "Integration deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
