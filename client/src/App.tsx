import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

//  NEW: Establish the live phone call to the Express server
const socket = io('http://localhost:5000');

interface Seat {
  _id: string;
  seatNumber: string;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED';
}

function App() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [heldSeats, setHeldSeats] = useState<string[]>([]); 
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Fetch initial seats on load
  useEffect(() => {
    fetch('http://localhost:5000/api/seats')
      .then((response) => response.json())
      .then((data) => setSeats(data))
      .catch((error) => console.error("Error fetching seats:", error));
  }, []);

  // NEW: Listen for real-time broadcasts from ANY user
  useEffect(() => {
    socket.on('seatUpdated', (updatedSeat: Seat) => {
      setSeats((prevSeats) =>
        prevSeats.map((seat) =>
          seat.seatNumber === updatedSeat.seatNumber ? updatedSeat : seat
        )
      );
    });

    // Cleanup the listener if the component unmounts
    return () => {
      socket.off('seatUpdated');
    };
  }, []);

  // Timer Logic for Multiple Seats
  useEffect(() => {
    if (timeLeft > 0 && heldSeats.length > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0 && heldSeats.length > 0) {
      heldSeats.forEach(seatNum => {
        fetch('http://localhost:5000/api/seats/release', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatNumber: seatNum }),
        });
      });
      setHeldSeats([]); // Clear local cart
    }
  }, [timeLeft, heldSeats]);

  const handleSeatClick = async (seatNumber: string, currentStatus: string) => {
    if (currentStatus !== 'AVAILABLE' || heldSeats.includes(seatNumber)) return;

    try {
      const response = await fetch('http://localhost:5000/api/seats/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatNumber: seatNumber }),
      });

      if (response.ok) {
        setHeldSeats((prev) => [...prev, seatNumber]); 
        setTimeLeft(10); 
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  const handlePayment = async () => {
    if (heldSeats.length === 0) return;

    try {
      for (const seatNum of heldSeats) {
        await fetch('http://localhost:5000/api/seats/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatNumber: seatNum }),
        });
      }
      
      setHeldSeats([]);
      setTimeLeft(0);
      alert(`Payment successful! Seats ${heldSeats.join(', ')} are booked.`);
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <div className="container">
      <h1>SeatSync</h1>
      
      <div className="seat-grid">
        {seats.map((seat) => (
          <div 
            key={seat._id} 
            className={`seat ${seat.status.toLowerCase()}`}
            onClick={() => handleSeatClick(seat.seatNumber, seat.status)}
          >
            {seat.seatNumber}
          </div>
        ))}
      </div>

      {heldSeats.length > 0 && (
        <div className="checkout-panel">
          <h2>Complete Your Booking</h2>
          <p>Seats Selected: <strong>{heldSeats.join(', ')}</strong></p>
          <h3 style={{ color: 'red' }}>Time remaining: 00:{timeLeft.toString().padStart(2, '0')}</h3>
          <button className="pay-btn" onClick={handlePayment}>
            Confirm Payment (Mock)
          </button>
        </div>
      )}
    </div>
  );
}

export default App;