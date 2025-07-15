const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { supabase } = require("../config/supabase");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || "./uploads";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `chat-history-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".csv", ".json", ".xlsx", ".txt"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`
        )
      );
    }
  },
});

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

// Upload chat history files
router.post(
  "/upload",
  authenticateUser,
  upload.array("chatFiles", 5),
  async (req, res, next) => {
    try {
      console.log("📁 Processing chat history upload for user:", req.user.id);

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files uploaded",
        });
      }

      const uploadedFiles = [];

      for (const file of req.files) {
        console.log(`📄 Processing file: ${file.originalname}`);

        // Parse file content (basic implementation for MVP)
        let chatData = [];
        try {
          if (
            file.mimetype === "application/json" ||
            path.extname(file.originalname) === ".json"
          ) {
            const content = fs.readFileSync(file.path, "utf8");
            chatData = JSON.parse(content);
          } else if (path.extname(file.originalname) === ".csv") {
            // Basic CSV parsing for MVP
            const content = fs.readFileSync(file.path, "utf8");
            const lines = content.split("\n").filter((line) => line.trim());
            chatData = lines.slice(1).map((line) => {
              const [timestamp, customer_message, agent_response] =
                line.split(",");
              return { timestamp, customer_message, agent_response };
            });
          } else {
            // For other file types, treat as plain text
            const content = fs.readFileSync(file.path, "utf8");
            chatData = [{ content: content }];
          }
        } catch (parseError) {
          console.error("❌ Error parsing file:", parseError.message);
          continue;
        }

        // Save to database
        const { data, error } = await supabase
          .from("training_data")
          .insert({
            user_id: req.user.id,
            filename: file.originalname,
            file_path: file.path,
            file_size: file.size,
            chat_count: Array.isArray(chatData) ? chatData.length : 1,
            processed_data: chatData,
            status: "uploaded",
          })
          .select()
          .single();

        if (error) {
          console.error("❌ Error saving training data:", error.message);
          continue;
        }

        uploadedFiles.push({
          id: data.id,
          filename: file.originalname,
          size: file.size,
          chatCount: Array.isArray(chatData) ? chatData.length : 1,
          status: "uploaded",
        });

        console.log(`✅ File processed: ${file.originalname}`);
      }

      res.json({
        success: true,
        message: `${uploadedFiles.length} file(s) uploaded successfully`,
        files: uploadedFiles,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get training data status
router.get("/status", authenticateUser, async (req, res, next) => {
  try {
    console.log("📊 Fetching training status for user:", req.user.id);

    const { data, error } = await supabase
      .from("training_data")
      .select("id, filename, file_size, chat_count, status, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching training data:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch training data",
      });
    }

    const totalChats = data.reduce(
      (sum, item) => sum + (item.chat_count || 0),
      0
    );
    const totalFiles = data.length;

    res.json({
      success: true,
      summary: {
        totalFiles,
        totalChats,
        status: totalFiles > 0 ? "ready" : "no_data",
      },
      files: data,
    });
  } catch (error) {
    next(error);
  }
});

// Start AI training process
router.post("/start", authenticateUser, async (req, res, next) => {
  try {
    console.log("🤖 Starting AI training for user:", req.user.id);

    // Get all uploaded training data
    const { data: trainingData, error } = await supabase
      .from("training_data")
      .select("*")
      .eq("user_id", req.user.id)
      .eq("status", "uploaded");

    if (error || !trainingData.length) {
      return res.status(400).json({
        success: false,
        error: "No training data available. Please upload chat history first.",
      });
    }

    // For MVP, simulate training process
    // In production, this would trigger actual AI training
    const trainingJob = {
      user_id: req.user.id,
      status: "training",
      progress: 0,
      started_at: new Date().toISOString(),
      total_chats: trainingData.reduce(
        (sum, item) => sum + (item.chat_count || 0),
        0
      ),
    };

    const { data: job, error: jobError } = await supabase
      .from("training_jobs")
      .insert(trainingJob)
      .select()
      .single();

    if (jobError) {
      console.error("❌ Error creating training job:", jobError.message);
      return res.status(500).json({
        success: false,
        error: "Failed to start training",
      });
    }

    // Update training data status
    await supabase
      .from("training_data")
      .update({ status: "training" })
      .eq("user_id", req.user.id)
      .eq("status", "uploaded");

    // Simulate training progress (for demo)
    setTimeout(async () => {
      await supabase
        .from("training_jobs")
        .update({
          status: "completed",
          progress: 100,
          completed_at: new Date().toISOString(),
        })
        .eq("id", job.id);

      await supabase
        .from("training_data")
        .update({ status: "trained" })
        .eq("user_id", req.user.id)
        .eq("status", "training");

      console.log("✅ Training simulation completed");
    }, 5000); // 5 second simulation

    res.json({
      success: true,
      message: "AI training started successfully",
      jobId: job.id,
      estimatedTime: "2-5 minutes",
      totalChats: trainingJob.total_chats,
    });
  } catch (error) {
    next(error);
  }
});

// Get training progress
router.get("/progress/:jobId", authenticateUser, async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const { data, error } = await supabase
      .from("training_jobs")
      .select("*")
      .eq("id", jobId)
      .eq("user_id", req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: "Training job not found",
      });
    }

    res.json({
      success: true,
      job: data,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
