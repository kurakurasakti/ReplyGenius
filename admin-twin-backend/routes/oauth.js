const express = require("express");
const crypto = require("crypto");
const { supabase } = require("../config/supabase");
const { encrypt } = require("../utils/encryption");

const router = express.Router();

// =================================================================
// Middleware to verify user is logged into ReplyGenius
// =================================================================
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, error: "Authorization token required" });
    }
    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// =================================================================
// Shopee OAuth Flow
// =================================================================

// Step 1: User clicks "Connect with Shopee", redirecting them here.
// This endpoint constructs the authorization URL and sends the user to Shopee.
router.get("/connect/shopee", (req, res) => {
  console.log("🛍️ Initiating Shopee OAuth connection...");

  // Replace with your actual Shopee Partner App credentials from your .env file
  const SHOPEE_PARTNER_ID = process.env.SHOPEE_PARTNER_ID;
  const SHOPEE_REDIRECT_URI = process.env.SHOPEE_REDIRECT_URI; // e.g., http://localhost:5001/api/oauth/callback/shopee

  if (!SHOPEE_PARTNER_ID || !SHOPEE_REDIRECT_URI) {
    return res
      .status(500)
      .send("Shopee application credentials are not configured on the server.");
  }

  // Generate a unique, unguessable 'state' to prevent CSRF attacks.
  const state = crypto.randomBytes(16).toString("hex");
  // TODO: In production, we should save this `state` in the user's session or a temporary cache to verify it on callback.

  const shopeeAuthUrl = `https://partner.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${SHOPEE_PARTNER_ID}&redirect=${SHOPEE_REDIRECT_URI}&sign=YOUR_GENERATED_SIGNATURE&state=${state}`;

  console.log(`Redirecting user to Shopee for authorization: ${shopeeAuthUrl}`);
  // In a real app, you would generate a signature for the URL. For now, we redirect.
  // Note: The signature generation process is complex and requires a secret key. We are skipping it for this MVP setup.

  res.redirect(shopeeAuthUrl);
});

// Step 2: Shopee redirects the user back here after they authorize the app.
router.get("/callback/shopee", async (req, res) => {
  const { code, shop_id, state } = req.query;
  console.log(
    `🛍️ Received callback from Shopee with code: ${code} for Shop ID: ${shop_id}`
  );

  // TODO: Verify the `state` parameter here against the one we saved in Step 1.

  if (!code || !shop_id) {
    return res
      .status(400)
      .send(
        "Authorization failed. Shopee did not return a valid code or shop_id."
      );
  }

  try {
    // Step 3: Exchange the authorization code for an access token.
    // This is a secure server-to-server call.
    console.log("Exchanging authorization code for an access token...");
    // const response = await axios.post('https://partner.shopeemobile.com/api/v2/auth/token/get', {
    //   code: code,
    //   partner_id: process.env.SHOPEE_PARTNER_ID,
    //   shop_id: shop_id,
    //   // ... other required params and signature
    // });

    // MOCK RESPONSE FOR MVP since we don't have real credentials yet
    const mockTokenData = {
      access_token: `MOCK_ACCESS_TOKEN_${crypto
        .randomBytes(16)
        .toString("hex")}`,
      refresh_token: `MOCK_REFRESH_TOKEN_${crypto
        .randomBytes(16)
        .toString("hex")}`,
      expires_in: 3600, // Expires in 1 hour
    };

    console.log("Successfully received mock access token.");

    // Step 4: Securely save the tokens to the database.
    // We need to associate this with the logged-in user.
    // In a real app, the user's ID would be stored in the session before the redirect.
    // For now, we can't save it because we don't know which user this is for.
    // This will be connected in the full implementation.
    console.log(
      "TODO: Save the following tokens to the database for the current user:"
    );
    console.log({
      platform: "shopee",
      shop_id: shop_id,
      access_token: mockTokenData.access_token,
      refresh_token: mockTokenData.refresh_token,
    });

    // Step 5: Redirect the user back to the frontend dashboard.
    const frontendDashboardUrl = `${process.env.FRONTEND_URL}/dashboard?shopee_connected=true`;
    res.redirect(frontendDashboardUrl);
  } catch (error) {
    console.error("❌ Error during Shopee OAuth token exchange:", error);
    res
      .status(500)
      .send("An error occurred while connecting your Shopee account.");
  }
});

// =================================================================
// TikTok Shop OAuth Flow
// =================================================================

router.get("/connect/tiktok", (req, res) => {
  console.log("🎵 Initiating TikTok Shop OAuth connection...");

  const TIKTOK_APP_KEY = process.env.TIKTOK_APP_KEY;
  const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI; // e.g., http://localhost:5001/api/oauth/callback/tiktok

  if (!TIKTOK_APP_KEY || !TIKTOK_REDIRECT_URI) {
    return res
      .status(500)
      .send(
        "TikTok Shop application credentials are not configured on the server."
      );
  }

  const state = crypto.randomBytes(16).toString("hex");
  // TODO: Save state to verify on callback.

  // Note: The scopes requested here determine what permissions your app gets.
  // 'shop.order' and 'shop.chat' would be relevant.
  const scopes = "user.info.basic,shop.order,shop.chat";
  const tiktokAuthUrl = `https://auth.tiktok-shops.com/oauth/authorize?app_key=${TIKTOK_APP_KEY}&scope=${scopes}&redirect_uri=${encodeURIComponent(
    TIKTOK_REDIRECT_URI
  )}&state=${state}&response_type=code`;

  console.log(
    `Redirecting user to TikTok Shop for authorization: ${tiktokAuthUrl}`
  );
  res.redirect(tiktokAuthUrl);
});

router.get("/callback/tiktok", async (req, res) => {
  const { code, state } = req.query;
  console.log(`🎵 Received callback from TikTok Shop with code: ${code}`);

  // TODO: Verify state.

  if (!code) {
    return res
      .status(400)
      .send("Authorization failed. TikTok Shop did not return a valid code.");
  }

  try {
    console.log("Exchanging TikTok authorization code for an access token...");
    // MOCK RESPONSE FOR MVP
    const mockTokenData = {
      access_token: `MOCK_TIKTOK_ACCESS_TOKEN_${crypto
        .randomBytes(16)
        .toString("hex")}`,
      refresh_token: `MOCK_TIKTOK_REFRESH_TOKEN_${crypto
        .randomBytes(16)
        .toString("hex")}`,
      expires_in: 86400, // Expires in 24 hours
      open_id: `MOCK_OPEN_ID_${crypto.randomBytes(8).toString("hex")}`,
      seller_name: "Toko Sukses Selalu",
    };

    console.log("TODO: Save TikTok tokens to the database.");

    const frontendDashboardUrl = `${process.env.FRONTEND_URL}/dashboard?tiktok_connected=true`;
    res.redirect(frontendDashboardUrl);
  } catch (error) {
    console.error("❌ Error during TikTok Shop OAuth token exchange:", error);
    res
      .status(500)
      .send("An error occurred while connecting your TikTok Shop account.");
  }
});

module.exports = router;
