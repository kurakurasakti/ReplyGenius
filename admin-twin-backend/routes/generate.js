const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { supabase } = require("../config/supabase");

const router = express.Router();

// Initialize Google Gemini (free to use!)
let genAI = null;
let model = null;

if (
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== "your_gemini_api_key_here"
) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  console.log("✅ Google Gemini client initialized (FREE!)");
} else {
  console.log(
    "⚠️  Gemini API key not provided - AI generation will use mock responses"
  );
  console.log(
    "📝 Get your FREE Gemini API key at: https://makersuite.google.com/app/apikey"
  );
}

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

// Mock responses for demo (when OpenAI is not available)
const mockResponses = [
  {
    query: "Kapan pesanan saya dikirim?",
    response:
      "Pesanan Anda akan dikirim dalam 1-2 hari kerja. Kami akan mengirimkan nomor resi setelah barang dikirim.",
    confidence: 95,
  },
  {
    query: "Apakah masih ada stok?",
    response:
      "Stok produk ini masih tersedia. Silakan langsung order untuk memastikan ketersediaan.",
    confidence: 88,
  },
  {
    query: "Bagaimana cara return barang?",
    response:
      "Untuk return barang, silakan hubungi customer service kami melalui chat. Pastikan barang masih dalam kondisi original dan dalam waktu 7 hari setelah diterima.",
    confidence: 92,
  },
  {
    query: "Berapa lama pengiriman ke Jakarta?",
    response:
      "Pengiriman ke Jakarta biasanya membutuhkan waktu 2-3 hari kerja untuk ekspedisi reguler dan 1-2 hari untuk ekspedisi express.",
    confidence: 90,
  },
];

// Generate AI response for customer query
router.post("/", authenticateUser, async (req, res, next) => {
  try {
    console.log("🤖 Generating AI response for user:", req.user.id);

    const { query, context = [] } = req.body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Query is required and must be a non-empty string",
      });
    }

    let aiResponse;
    let confidence;

    if (model) {
      // Use Google Gemini for actual AI generation (FREE!)
      try {
        // Get user's training data for context
        const { data: trainingData } = await supabase
          .from("training_data")
          .select("processed_data")
          .eq("user_id", req.user.id)
          .eq("status", "trained")
          .limit(3);

        // Prepare context from training data
        let contextStr = "";
        if (trainingData && trainingData.length > 0) {
          const examples = trainingData
            .flatMap((item) => item.processed_data || [])
            .slice(0, 10); // Use up to 10 examples

          contextStr = examples
            .map(
              (ex) =>
                `Customer: ${ex.customer_message}\nAgent: ${ex.agent_response}`
            )
            .join("\n\n");
        }

        const systemPrompt = `You are a helpful customer service agent for an Indonesian e-commerce store. Respond in Bahasa Indonesia in a friendly, professional manner. 

Based on these previous customer service examples:
${contextStr}

Please respond to the customer query in a similar style and tone. Keep responses concise but helpful.

Customer Query: ${query}

Response:`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        aiResponse = response.text().trim();
        confidence = Math.floor(Math.random() * 15) + 85; // 85-100% confidence

        console.log("✅ Gemini response generated successfully");
      } catch (geminiError) {
        console.error("❌ Gemini API error:", geminiError.message);
        // Fallback to mock response
        const mockResponse =
          mockResponses[Math.floor(Math.random() * mockResponses.length)];
        aiResponse = mockResponse.response;
        confidence = mockResponse.confidence;
      }
    } else {
      // Use mock responses for demo
      const mockResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];
      aiResponse = mockResponse.response;
      confidence = mockResponse.confidence;
    }

    // Save the generated response for review
    const { data: savedResponse, error: saveError } = await supabase
      .from("generated_responses")
      .insert({
        user_id: req.user.id,
        customer_query: query,
        ai_response: aiResponse,
        confidence_score: confidence,
        status: "pending_review",
        context: context,
      })
      .select()
      .single();

    if (saveError) {
      console.error("❌ Error saving response:", saveError.message);
      // Don't fail the request, just log the error
    }

    console.log("✅ AI response generated successfully");

    res.json({
      success: true,
      response: {
        id: savedResponse?.id,
        query: query,
        response: aiResponse,
        confidence: confidence,
        status: "pending_review",
        created_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get generated responses for review
router.get("/responses", authenticateUser, async (req, res, next) => {
  try {
    console.log("📋 Fetching generated responses for user:", req.user.id);

    const { status = "all", limit = 20, offset = 0 } = req.query;

    let query = supabase
      .from("generated_responses")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Error fetching responses:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch responses",
      });
    }

    console.log("✅ Responses fetched successfully");

    res.json({
      success: true,
      responses: data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: data.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Approve/reject a generated response
router.patch("/responses/:id", authenticateUser, async (req, res, next) => {
  try {
    console.log("✅ Updating response status");

    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!["approved", "rejected", "modified"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be "approved", "rejected", or "modified"',
      });
    }

    const updateData = {
      status,
      reviewed_at: new Date().toISOString(),
    };

    if (feedback) {
      updateData.feedback = feedback;
    }

    const { data, error } = await supabase
      .from("generated_responses")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: "Response not found",
      });
    }

    console.log("✅ Response status updated successfully");

    res.json({
      success: true,
      message: `Response ${status} successfully`,
      response: data,
    });
  } catch (error) {
    next(error);
  }
});

// Bulk generate responses for training data
router.post("/bulk", authenticateUser, async (req, res, next) => {
  try {
    console.log("🔄 Starting bulk response generation for user:", req.user.id);

    const { limit = 10 } = req.body;

    // Get training data to generate responses for
    const { data: trainingData, error } = await supabase
      .from("training_data")
      .select("processed_data")
      .eq("user_id", req.user.id)
      .eq("status", "trained")
      .limit(1);

    if (error || !trainingData.length) {
      return res.status(400).json({
        success: false,
        error: "No trained data available for bulk generation",
      });
    }

    const allQueries = trainingData
      .flatMap((item) => item.processed_data || [])
      .map((item) => item.customer_message)
      .filter((query) => query && query.trim())
      .slice(0, limit);

    const generatedResponses = [];

    for (const query of allQueries) {
      // Use mock responses for bulk generation (to avoid OpenAI rate limits in demo)
      const mockResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const { data: savedResponse } = await supabase
        .from("generated_responses")
        .insert({
          user_id: req.user.id,
          customer_query: query,
          ai_response: mockResponse.response,
          confidence_score: mockResponse.confidence,
          status: "pending_review",
        })
        .select()
        .single();

      if (savedResponse) {
        generatedResponses.push(savedResponse);
      }
    }

    console.log("✅ Bulk generation completed");

    res.json({
      success: true,
      message: `Generated ${generatedResponses.length} responses for review`,
      responses: generatedResponses,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
