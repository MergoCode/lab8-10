import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/MovieInner.sass";
import Cookies from "js-cookie";
import useFetchHallByMovie from "../hooks/useFetchHallByMovie";
import SeatsBookingComponent from "../components/SeatBookingComponent";

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

const MovieInnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const movieId = parseInt(id || '0');
  const navigate = useNavigate();
  
  const { resultHalls, loading: hallsLoading, error: hallsError } = useFetchHallByMovie({ id: movieId });
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userBookings, setUserBookings] = useState<BookingInfo[]>([]);
  
  useEffect(() => {
    const userEmail = Cookies.get('email');
    const userName = Cookies.get('name');
    setIsAuthenticated(!!(userEmail && userName));
  }, []);

  useEffect(() => {
    const getBookingCookies = () => {
      const allCookies = Cookies.get();
      
      const filtered = Object.entries(allCookies).filter(([key]) => 
        key.includes('booking_')
      );
      
      return Object.fromEntries(filtered);
    };

    const allBookingsObj = getBookingCookies();
    const allBookings: BookingInfo[] = [];
    
    for (const key in allBookingsObj) {
      try {
        allBookings.push(JSON.parse(allBookingsObj[key]));
      } catch (e) {
        console.error("Failed to parse booking cookie:", e);
      }
    }
    
    setUserBookings(allBookings);
  }, []);
  
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
  
  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
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
          {movie.poster_url && (
            <div className="movie-poster">
              <img src={movie.poster_url} alt={movie.title} />
            </div>
          )}
          <div className="movie-text-data">

          <h1 className="movie-title">{movie.title}</h1>
          <div className="movie-metadata">
            <span className="duration">{movie.duration} хвилин</span>
            <span className="genre">Жанр: {movie.genre}</span>
          </div>
          
          <p className="movie-description">{movie.description}</p>
          </div>
        </div>
      )}
      
      <div className="sessions-container">
        <h2>Сеанси</h2>
        
        {sessions.length === 0 ? (
          <p className="no-sessions">Немає доступних сеансів</p>
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
        <SeatsBookingComponent
          selectedSession={selectedSession}
          movie={movie}
          resultHalls={resultHalls}
          isAuthenticated={isAuthenticated}
          userBookings={userBookings}
          setUserBookings={setUserBookings}
        />
      )}
    </div>
  );
};

export default MovieInnerPage;