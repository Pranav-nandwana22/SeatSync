import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Global Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests

// 2. Basic Logger Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 3. Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'SeatSync server is running correctly',
        timestamp: new Date().toISOString()
    });
});

// 4. Global Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Something went wrong on the server!'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});