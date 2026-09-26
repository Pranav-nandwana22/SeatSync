import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import seatRoutes from './routes/seatRoutes';

// NEW IMPORTS FOR SOCKET.IO
import { createServer } from 'http'; 
import { Server } from 'socket.io'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CREATE THE REAL-TIME SERVER
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // Trust your React frontend
        methods: ["GET", "POST"]
    }
});

// 2. LISTEN FOR LIVE CONNECTIONS
io.on("connection", (socket) => {
    console.log(`🟢 New live client connected: ${socket.id}`);
    
    socket.on("disconnect", () => {
        console.log(`🔴 Client disconnected: ${socket.id}`);
    });
});

// 3. SHARE THE SOCKET INSTANCE WITH YOUR ROUTES
app.set('io', io);

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log("Local mongoDB connected successfully!");
    } catch(error) {
        console.log("MongoDB connection failed:", error);
        process.exit(1);
    }
};

app.use(cors());
app.use(express.json()); 

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use('/api/seats', seatRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server!' });
});

connectDB();

// 4. START THE HTTP SERVER (Not the Express app directly)
httpServer.listen(PORT, () => {
    console.log(`🚀 Server & WebSockets are running on http://localhost:${PORT}`);
});