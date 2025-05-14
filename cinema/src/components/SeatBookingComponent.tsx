import React, { useState, useEffect } from "react";
import api from "../api";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface Seat {
  id: number;
  row: string;
  seat_number: number;
  status: 'available' | 'booked' | 'your-booking';
}

interface Session {
  id: number;
  movie_id: number;
  hall_id: number;
  start_time: string;
  price: number;
  hall_name: string;
  movie_title: string;
}

interface Hall {
  id: number;
  name: string;
  capacity: number;
}

interface BookingStatus {
  type: 'success' | 'error' | null;
  message: string;
}

interface SeatsByRowMap {
  [key: string]: Seat[];
}

interface BookingInfo {
  sessionId: number;
  movieTitle: string;
  hallName: string;
  startTime: string;
  seats: {
    id: number;
    row: string;
    seat_number: number;
  }[];
  price: number;
}

interface SeatsBookingComponentProps {
  selectedSession: Session | null;
  movie: any;
  resultHalls: Hall[];
  isAuthenticated: boolean;
  userBookings: BookingInfo[];
  setUserBookings: React.Dispatch<React.SetStateAction<BookingInfo[]>>;
}

const SeatsBookingComponent: React.FC<SeatsBookingComponentProps> = ({
  selectedSession,
  movie,
  resultHalls,
  isAuthenticated,
  userBookings,
  setUserBookings
}) => {
  const navigate = useNavigate();
  
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>({ type: null, message: '' });
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedSession) return;
      
      try {
        setLoading(true);
        
        const sessionResponse = await api.get(`/sessions/${selectedSession.id}`);
        
        const hallForSession = resultHalls.find(hall => hall.id === selectedSession.hall_id);
        if (hallForSession) {
          setSelectedHall(hallForSession);
        }
        
        const hallResponse = await api.get(`/halls/${selectedSession.hall_id}`);
        
        if (hallResponse.data.data && hallResponse.data.data.seats) {
          const hallSeats = hallResponse.data.data.seats;
          
          const bookedSeatsResponse = await api.get(`/bookings`, {headers: {
            Authorization: `Bearer ${Cookies.get("token")}`
          }});
          console.log(bookedSeatsResponse);
          const allBookedSeats: Array<{row: string|number, seat_number: number}> = [];
          
          if (bookedSeatsResponse.data && bookedSeatsResponse.data.data) {
            const sessionBookings = bookedSeatsResponse.data.data.filter((booking: any) => 
              new Date(booking.start_time).getTime() === new Date(selectedSession.start_time).getTime()
            );
            console.log(sessionBookings);
            
            sessionBookings.forEach((booking: any) => {
              if (booking.seats && booking.seats.length > 0) {
                booking.seats.forEach((seat: any) => {
                  allBookedSeats.push(seat);
                });
              }
            });
          }
          
          const userBookedSeats: number[] = [];
          userBookings.forEach(booking => {
            if (booking.sessionId === selectedSession.id) {
              booking.seats.forEach(seat => {
                userBookedSeats.push(seat.id);
              });
            }
          });
          
          const processedSeats = hallSeats.map((seat: any) => {
            // Check if seat is booked by any user
            const isBooked = allBookedSeats.some(
              bookedSeat => 
                String(bookedSeat.row) === String(seat.row) && 
                bookedSeat.seat_number === seat.seat_number
            );
            
            // Check if seat is booked by current user
            const isUserBooking = userBookings.some(booking => 
              booking.sessionId === selectedSession.id && 
              booking.seats.some(
                userSeat => 
                  String(userSeat.row) === String(seat.row) && 
                  userSeat.seat_number === seat.seat_number
              )
            );
            
            return {
              ...seat,
              status: isUserBooking 
                ? 'your-booking' 
                : isBooked 
                  ? 'booked' 
                  : 'available'
            };
          });
          
          setSeats(processedSeats);
        } else {
          if (hallForSession) {
            const capacity = hallForSession.capacity || 60;
            
            // Fetch bookings from the API
            const bookedSeatsResponse = await api.get(`/bookings`);
            const allBookedSeats: Array<{row: string|number, seat_number: number}> = [];
            
            if (bookedSeatsResponse.data && bookedSeatsResponse.data.data) {
              // Filter bookings for the current session
              const sessionBookings = bookedSeatsResponse.data.data.filter((booking: any) => 
                new Date(booking.start_time).getTime() === new Date(selectedSession.start_time).getTime()
              );
              
              // Extract all booked seats
              sessionBookings.forEach((booking: any) => {
                if (booking.seats && booking.seats.length > 0) {
                  booking.seats.forEach((seat: any) => {
                    allBookedSeats.push(seat);
                  });
                }
              });
            }
            
            const rows = ['1', '2', '3', '4', '5', '6'];
            const seatsPerRow = Math.ceil(capacity / rows.length);
            
            const generatedSeats: Seat[] = [];
            let seatId = 1;
            
            const userBookedSeats: Array<{id: number, row: string, seat_number: number}> = [];
            userBookings.forEach(booking => {
              if (booking.sessionId === selectedSession.id) {
                booking.seats.forEach(seat => {
                  userBookedSeats.push(seat);
                });
              }
            });
            
            for (const row of rows) {
              for (let i = 1; i <= seatsPerRow; i++) {
                if (generatedSeats.length < capacity) {
                  // Check if this seat is booked by another user
                  const isBooked = allBookedSeats.some(
                    seat => seat.row === row && seat.seat_number === i
                  );
                  
                  // Check if this seat is booked by the current user
                  const userBookedSeat = userBookedSeats.find(
                    seat => seat.row === row && seat.seat_number === i
                  );
                  
                  let status = 'available';
                  if (userBookedSeat) {
                    status = 'your-booking';
                  } else if (isBooked) {
                    status = 'booked';
                  }
                  
                  generatedSeats.push({
                    id: seatId++,
                    row,
                    seat_number: i,
                    status
                  });
                }
              }
            }
            
            setSeats(generatedSeats);
          }
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load seats');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchSeats();
  }, [selectedSession, resultHalls, userBookings]);
  
  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'booked' || seat.status === 'your-booking') return;
    
    setSelectedSeats(prev => {
      const isSeatSelected = prev.some(s => s.id === seat.id);
      
      if (isSeatSelected) {
        return prev.filter(s => s.id !== seat.id);
      } else {
        return [...prev, seat];
      }
    });
  };
  
  const handleBooking = async () => {
    if (!isAuthenticated) {
      setBookingStatus({
        type: 'error',
        message: 'Please log in to book seats'
      });
      return;
    }
    
    if (selectedSeats.length === 0) {
      setBookingStatus({
        type: 'error',
        message: 'Please select at least one seat'
      });
      return;
    }
    
    try {
      const userEmail = Cookies.get('email');
      const userName = Cookies.get('name');
      
      const response = await api.post('/bookings', {
        session_id: selectedSession?.id,
        seat_ids: selectedSeats.map(seat => seat.id)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      
      const bookingInfo: BookingInfo = {
        sessionId: selectedSession!.id,
        movieTitle: selectedSession!.movie_title || movie?.title || 'Unknown movie',
        hallName: selectedSession!.hall_name || 'Unknown hall',
        startTime: selectedSession!.start_time,
        seats: selectedSeats.map(seat => ({
          id: seat.id,
          row: seat.row,
          seat_number: seat.seat_number
        })),
        price: selectedSession!.price
      };
      
      const bookingId = `booking_${Date.now()}`;
      Cookies.set(bookingId, JSON.stringify(bookingInfo), { expires: 365 });
      
      setUserBookings(prev => [...prev, bookingInfo]);
      
      setBookingStatus({
        type: 'success',
        message: 'Booking successful!'
      });
      
      setSelectedSeats([]);
      
      if (selectedSession) {
        const seatsResponse = await api.get(`/sessions/${selectedSession.id}`);
        setSeats(seatsResponse.data.data.seats);
      }
      
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
      
    } catch (err: any) {
      let errorMessage = 'Booking failed. Please try again.';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }
      
      setBookingStatus({
        type: 'error',
        message: errorMessage
      });
      
      console.error(err);
    }
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const seatsByRow: SeatsByRowMap = seats.reduce((acc: SeatsByRowMap, seat) => {
    const row = seat.row;
    if (!acc[row]) {
      acc[row] = [];
    }
    acc[row].push(seat);
    return acc;
  }, {});
  
  if (loading) {
    return <div className="loading">Loading seats...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="booking-section">
      <h2>Select Seats for {formatDate(selectedSession!.start_time)} at {formatTime(selectedSession!.start_time)}</h2>
      
      <div className="screen-container">
        <div className="screen">
          <div className="screen-label">Screen</div>
        </div>
      </div>
      
      <div className="seats-container">
        {Object.keys(seatsByRow).sort().map(row => (
          <div key={row} className="seat-row">
            <div className="row-label">{row}</div>
            <div className="seats">
              {seatsByRow[row].sort((a, b) => a.seat_number - b.seat_number).map(seat => (
                <div 
                  key={seat.id}
                  className={`seat ${seat.status} ${selectedSeats.some(s => s.id === seat.id) ? 'selected' : ''}`}
                  onClick={() => handleSeatSelect(seat)}
                >
                  <div className="seat-number">{seat.seat_number}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="booking-legend">
        <div className="legend-item">
          <div className="seat-example available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="seat-example selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="seat-example booked"></div>
          <span>Booked</span>
        </div>
        <div className="legend-item">
          <div className="seat-example your-booking"></div>
          <span>Your Booking</span>
        </div>
      </div>
      
      <div className="booking-summary">
        <div className="selected-seats-info">
          <span className="seats-count">Selected seats: {selectedSeats.length}</span>
          {selectedSeats.length > 0 && (
            <span className="total-price">
              Total: ${(selectedSeats.length * selectedSession!.price).toFixed(2)}
            </span>
          )}
        </div>
        
        {!isAuthenticated && selectedSeats.length > 0 && (
          <div className="auth-notice">
            Please log in to complete your booking
          </div>
        )}
        
        <button 
          className="booking-button"
          disabled={selectedSeats.length === 0}
          onClick={handleBooking}
        >
          Book Seats
        </button>
      </div>
      
      {bookingStatus.type && (
        <div className={`booking-message ${bookingStatus.type}`}>
          {bookingStatus.message}
        </div>
      )}
    </div>
  );
};

export default SeatsBookingComponent;