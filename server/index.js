import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import { initSocket } from "./socket/index.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [process.env.CLIENT_URL, "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: [process.env.CLIENT_URL, "http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));

app.options("*", cors());

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => res.json({ status: "TTC Online server running" }));

initSocket(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));