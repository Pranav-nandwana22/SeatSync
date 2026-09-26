import express, { Request, Response } from 'express';
import Seat from '../models/Seat';

const router = express.Router();

router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const seats = await Seat.find();
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching seats" });
  }
});

router.post('/book', async (req: Request, res: Response): Promise<any> => {
    try {
        const { seatNumber } = req.body;
        const seat = await Seat.findOne({ seatNumber: seatNumber });
        
        if (!seat) return res.status(404).json({ message: "Seat not found" });
        if (seat.status !== 'AVAILABLE') return res.status(400).json({ message: "Seat taken!" });
        
        seat.status = 'BOOKED';
        await seat.save();
        
        // 🟢 NEW: Broadcast the updated seat to all connected users instantly
        req.app.get('io').emit('seatUpdated', seat);
        
        res.status(200).json({ message: `Success! Seat ${seatNumber} is booked`, seat });
    } catch (error) {
        res.status(500).json({ message: "Error booking" });
    }
});

router.post('/hold', async (req: Request, res: Response): Promise<any> => {
    try {
        const { seatNumber } = req.body;
        const heldSeat = await Seat.findOneAndUpdate(
            { seatNumber: seatNumber, status: 'AVAILABLE' },
            { status: 'HELD' },
            { returnDocument: 'after' } // Fixed Mongoose warning
        );
        if (!heldSeat) return res.status(409).json({ message: "Too late!" });
        
        // 🟢 NEW: Broadcast the yellow 'HELD' status
        req.app.get('io').emit('seatUpdated', heldSeat);
        
        res.status(200).json({ message: `Seat ${seatNumber} held.`, seat: heldSeat });
    } catch (error) {
        res.status(500).json({ message: "Error holding" });
    }
});

router.post('/release', async (req: Request, res: Response): Promise<any> => {
    try {
        const { seatNumber } = req.body;
        const releasedSeat = await Seat.findOneAndUpdate(
            { seatNumber: seatNumber, status: 'HELD' },
            { status: 'AVAILABLE' },
            { returnDocument: 'after' } // Fixed Mongoose warning
        );
        if (!releasedSeat) return res.status(404).json({ message: "Seat not found" });
        
        // 🟢 NEW: Broadcast the green 'AVAILABLE' status when a timer expires
        req.app.get('io').emit('seatUpdated', releasedSeat);
        
        res.status(200).json({ message: `Seat ${seatNumber} released.`, seat: releasedSeat });
    } catch (error) {
        res.status(500).json({ message: "Error releasing" });
    }
});

export default router;