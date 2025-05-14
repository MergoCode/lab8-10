import React, { useState, useEffect } from "react";
import api from "../api";
import Cookies from "js-cookie";
interface BookingDisplayProps {
  movieId?: string;
}

interface Booking {
  id: number;
  booking_date: string;
  total_price: string;
  status: string;
  start_time: string;
  movie_title: string;
  hall_name: string;
  seats: {
    row: number | string;
    seat_number: number;
  }[];
}

const BookingsDisplay: React.FC<BookingDisplayProps> = ({ movieId }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const response = await api.get('/bookings', {headers: {
            Authorization: `Bearer ${Cookies.get("token")}`
        }});
        
        let fetchedBookings = response.data.data;
        console.log(fetchedBookings);
        if (movieId) {
          fetchedBookings = fetchedBookings.filter((booking: Booking) => {
            return booking.movie_title == movieId;
          });
          console.log(fetchedBookings);
        }
        
        setBookings(fetchedBookings);
        setLoading(false);
      } catch (err) {
        setError('Failed to load bookings');
        setLoading(false);
        console.error(err);
      }
    };
    
    fetchBookings();
  }, [movieId]);
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  if (loading) {
    return <div className="bookings-loading">Loading bookings...</div>;
  }
  
  if (error) {
    return <div className="bookings-error">{error}</div>;
  }
  
  if (bookings.length === 0) {
    return <div className="no-bookings">No bookings found</div>;
  }
  
  return (
    <div className="bookings-display">
      <h2>Current Bookings</h2>
      <div className="bookings-list">
        {bookings.map(booking => (
          <div key={booking.id} className="booking-item">
            <div className="booking-header">
              <h3>{booking.movie_title}</h3>
              <span className="booking-status">{booking.status}</span>
            </div>
            <div className="booking-details">
              <div className="booking-venue">
                <span className="venue-name">{booking.hall_name}</span>
                <span className="session-time">
                  {formatDate(booking.start_time)} at {formatTime(booking.start_time)}
                </span>
              </div>
              <div className="booking-seats">
                <span className="seats-label">Seats:</span>
                <span className="seats-list">
                  {booking.seats.map((seat, idx) => (
                    <span key={idx} className="seat-info">
                      Row {seat.row}, Seat {seat.seat_number}
                      {idx < booking.seats.length - 1 ? '; ' : ''}
                    </span>
                  ))}
                </span>
              </div>
              <div className="booking-price">
                Total: ${parseFloat(booking.total_price).toFixed(2)}
              </div>
              <div className="booking-date">
                Booked on: {formatDate(booking.booking_date)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsDisplay;