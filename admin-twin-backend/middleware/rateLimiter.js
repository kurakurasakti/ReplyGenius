// Simple in-memory rate limiter for MVP
// For production, use Redis-based rate limiter
const rateLimit = {};

const rateLimiter = (req, res, next) => {
  // Skip rate limiting in development for easier testing
  if (process.env.NODE_ENV === "development") {
    return next();
  }

  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // max requests per window

  // Clean up old entries
  if (rateLimit[ip]) {
    rateLimit[ip] = rateLimit[ip].filter((time) => now - time < windowMs);
  } else {
    rateLimit[ip] = [];
  }

  // Check if rate limit exceeded
  if (rateLimit[ip].length >= maxRequests) {
    console.log(`🚫 Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      success: false,
      error: "Too many requests",
      message: `Rate limit exceeded. Max ${maxRequests} requests per ${
        windowMs / 1000 / 60
      } minutes`,
      retryAfter: Math.ceil((rateLimit[ip][0] + windowMs - now) / 1000),
    });
  }

  // Add current request
  rateLimit[ip].push(now);

  // Add rate limit headers
  res.set({
    "X-RateLimit-Limit": maxRequests,
    "X-RateLimit-Remaining": Math.max(0, maxRequests - rateLimit[ip].length),
    "X-RateLimit-Reset": new Date(now + windowMs).toISOString(),
  });

  next();
};

module.exports = rateLimiter;
