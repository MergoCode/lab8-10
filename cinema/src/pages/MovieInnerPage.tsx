import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/MovieInner.sass";
import Cookies from "js-cookie";
import useFetchHallByMovie from "../hooks/useFetchHallByMovie";

interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  genre: string;
  poster_url: string;
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

interface Seat {
  id: number;
  row: string;
  seat_number: number;
  status: 'available' | 'booked';
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

const MovieInnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0');
  const navigate = useNavigate();
  
  // Используем хук для получения информации о залах
  const { resultHalls, loading: hallsLoading, error: hallsError } = useFetchHallByMovie({ id: movieId });
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>({ type: null, message: '' });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedHall, setSelectedHall] = useState<Hall | null>(null);
  
  // Check authentication status
  useEffect(() => {
    const userEmail = Cookies.get('email');
    const userName = Cookies.get('name');
    setIsAuthenticated(!!(userEmail && userName));
  }, []);
  
  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await api.get(`/movies/${movieId}`);
        setMovie(response.data.data);
      } catch (err) {
        setError('Failed to load movie details');
        console.error(err);
      }
    };
    
    if (movieId) {
      fetchMovie();
    }
  }, [movieId]);
  
  // Fetch sessions for this movie
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await api.get(`/sessions?movie_id=${movieId}`);
        setSessions(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load sessions');
        setLoading(false);
        console.error(err);
      }
    };
    
    if (movieId) {
      fetchSessions();
    }
  }, [movieId]);
  
  // Обновляем эффект для получения информации о сидениях с учетом залов
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedSession) return;
      
      try {
        setLoading(true);
        
        // Получаем детали сессии
        const sessionResponse = await api.get(`/sessions/${selectedSession.id}`);
        
        // Находим зал, соответствующий выбранной сессии
        const hallForSession = resultHalls.find(hall => hall.id === selectedSession.hall_id);
        if (hallForSession) {
          setSelectedHall(hallForSession);
        }
        
        // Получаем информацию о местах
        const hallResponse = await api.get(`/halls/${selectedSession.hall_id}`);
        
        // Если в ответе есть данные о местах
        if (hallResponse.data.data && hallResponse.data.data.seats) {
          // Создаем массив мест с учетом их статуса
          const hallSeats = hallResponse.data.data.seats;
          
          // Получаем информацию о забронированных местах для текущей сессии
          const bookedSeatsResponse = await api.get(`/sessions/${selectedSession.id}`);
          console.log(bookedSeatsResponse.data);
          const bookedSeatIds = bookedSeatsResponse.data.seats ? 
            bookedSeatsResponse.data.seats.map((booking: any) => booking.seat_id) : [];
          
          // Обновляем статус мест, добавляя статус 'booked' для забронированных мест
          const processedSeats = hallSeats.map((seat: any) => ({
            ...seat,
            status: bookedSeatIds.includes(seat.id) ? 'booked' : 'available'
          }));
          
          setSeats(processedSeats);
        } else {
          // Если нет данных о местах, создаем места на основе емкости зала
          if (hallForSession) {
            const capacity = hallForSession.capacity || 60; // Используем значение по умолчанию, если capacity не указана
            
            // Создаем 6 рядов по 10 мест (или другое количество, в зависимости от емкости)
            const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
            const seatsPerRow = Math.ceil(capacity / rows.length);
            
            const generatedSeats: Seat[] = [];
            let seatId = 1;
            
            for (const row of rows) {
              for (let i = 1; i <= seatsPerRow; i++) {
                if (generatedSeats.length < capacity) {
                  generatedSeats.push({
                    id: seatId++,
                    row,
                    seat_number: i,
                    status: 'available'
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
  }, [selectedSession, resultHalls]);
  
  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    setSelectedSeats([]);
    setBookingStatus({ type: null, message: '' });
  };
  
  const handleSeatSelect = (seat: Seat) => {
    if (seat.status === 'booked') return;
    
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
      
      // Use the booking API based on your backend controller
      const response = await api.post('/bookings', {
        session_id: selectedSession?.id,
        seat_ids: selectedSeats.map(seat => seat.id)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });
      
      setBookingStatus({
        type: 'success',
        message: 'Booking successful!'
      });
      
      // Reset selected seats
      setSelectedSeats([]);
      
      // Refresh seats to update availability
      if (selectedSession) {
        const seatsResponse = await api.get(`/sessions/${selectedSession.id}`);
        setSeats(seatsResponse.data.data.seats);
      }
      
      // Navigate to bookings page after a delay
      setTimeout(() => {
        navigate('/bookings');
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
  
  // Format date and time
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Group seats by row for better display
  const seatsByRow: SeatsByRowMap = seats.reduce((acc: SeatsByRowMap, seat) => {
    const row = seat.row;
    if (!acc[row]) {
      acc[row] = [];
    }
    acc[row].push(seat);
    return acc;
  }, {});
  
  if ((loading && !movie && !sessions.length) || hallsLoading) {
    return <div className="movie-inner-page"><div className="loading">Loading...</div></div>;
  }
  
  if (error || hallsError) {
    return <div className="movie-inner-page"><div className="error">{error || hallsError}</div></div>;
  }
  
  return (
    <div className="movie-inner-page">
      {movie && (
        <div className="movie-details">
          <h1 className="movie-title">{movie.title}</h1>
          <div className="movie-metadata">
            <span className="duration">{movie.duration} min</span>
            <span className="genre">{movie.genre}</span>
          </div>
          {movie.poster_url && (
            <div className="movie-poster">
              <img src={movie.poster_url} alt={movie.title} />
            </div>
          )}
          <p className="movie-description">{movie.description}</p>
        </div>
      )}
      
      <div className="sessions-container">
        <h2>Available Sessions</h2>
        
        {sessions.length === 0 ? (
          <p className="no-sessions">No sessions available for this movie</p>
        ) : (
          <div className="sessions-list">
            {sessions.map(session => (
              <div 
                key={session.id} 
                className={`session-item ${selectedSession && selectedSession.id === session.id ? 'selected' : ''}`}
                onClick={() => handleSessionSelect(session)}
              >
                <div className="session-date">{formatDate(session.start_time)}</div>
                <div className="session-time">{formatTime(session.start_time)}</div>
                <div className="session-hall">{session.hall_name}</div>
                <div className="session-price">${Number(session.price).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedSession && (
        <div className="booking-section">
          <h2>Select Seats for {formatDate(selectedSession.start_time)} at {formatTime(selectedSession.start_time)}</h2>
          
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
          </div>
          
          <div className="booking-summary">
            <div className="selected-seats-info">
              <span className="seats-count">Selected seats: {selectedSeats.length}</span>
              {selectedSeats.length > 0 && (
                <span className="total-price">
                  Total: ${(selectedSeats.length * selectedSession.price).toFixed(2)}
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
      )}
    </div>
  );
};

export default MovieInnerPage;