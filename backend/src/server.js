const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");


const connectDB = require("./config/db");

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("Server start failed:", error.message);
    process.exit(1);
  }
};

startServer();