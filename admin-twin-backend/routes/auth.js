const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");

const router = express.Router();

// Register new user
router.post("/register", async (req, res, next) => {
  try {
    console.log("📝 Registration attempt:", { email: req.body.email });

    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: "Email, password, and name are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters long",
      });
    }

    // Use Supabase Auth for registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      console.error("❌ Registration error:", error.message);
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    console.log("✅ User registered successfully:", email);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please check your email for verification.",
      user: {
        id: data.user?.id,
        email: data.user?.email,
        name: data.user?.user_metadata?.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login user
router.post("/login", async (req, res, next) => {
  try {
    console.log("🔐 Login attempt:", { email: req.body.email });

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
    }

    // Use Supabase Auth for login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("❌ Login error:", error.message);
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    console.log("✅ User logged in successfully:", email);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Refresh session
router.post("/refresh", async (req, res, next) => {
  try {
    console.log("🔄 Token refresh attempt");

    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      console.error("❌ Token refresh error:", error.message);
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      });
    }

    console.log("✅ Token refreshed successfully");

    res.json({
      success: true,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Logout user
router.post("/logout", async (req, res, next) => {
  try {
    console.log("👋 Logout attempt");

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      // Set session and sign out
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: req.body.refresh_token || "",
      });

      await supabase.auth.signOut();
    }

    console.log("✅ User logged out successfully");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get("/me", async (req, res, next) => {
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

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
