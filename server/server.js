import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";

// Initialize Express App
const app = express();

// Connect Database
await connectDB();

// Middleware
app.use(
  cors({
    origin: [
      "https://vrooom-l2h7.vercel.app",
      "http://localhost:5173"
    ],
    credentials: true, // if using cookies/auth
  })
);

app.use(express.json());

app.get("/", (req, res) => res.send("Server is running"));

app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));