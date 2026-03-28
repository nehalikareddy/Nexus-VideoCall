import express from "express";
import { createServer } from "node:http";

import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import userRoutes from "./routes/users.routes.js";
import meetingRoutes from "./routes/meetings.routes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000))
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/api/meetings", meetingRoutes);

const start = async () => {
    console.log("Environment check: MONGO_URI is", process.env.MONGO_URI ? "Defined" : "MISSING");
    console.log("Environment check: GEMINI_API_KEY is", process.env.GEMINI_API_KEY ? "Defined" : "MISSING");
    app.set("mongo_user")
    let connectionDb;
    try {
        connectionDb = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
    } catch (err) {
        console.log("Mongo connection failed; continuing without DB. Error:", err?.message || err);
    }

    server.listen(app.get("port"), '0.0.0.0', () => {
        console.log("LISTENIN ON PORT 8000")
    });



}



start();
