const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  username: process.env.REDIS_USER || "default",
  password: process.env.REDIS_PASS,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT) || 17812,
  },
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Connected to Redis successfully"));

// Auto-connect on startup
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
})();

module.exports = redisClient;
