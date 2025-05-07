import React, { useState, useEffect } from "react";
import useFetchHallByMovie from "../hooks/useFetchHallByMovie";
import { useParams } from "react-router-dom";
import "../styles/MovieInner.sass";
import Cookies from "js-cookie";
import api from "../api";

// Типи даних
type BookingData = {
  hallId: number;
  seatIndexes: number[];
  movieId: number;
  userName: string;
  userEmail: string;
};

// Компонент крісла
const Seat: React.FC<{ 
  seatIndex: number;
  isSelected?: boolean; 
  isBooked?: boolean;
  onClick?: () => void 
}> = ({ 
  seatIndex,
  isSelected = false, 
  isBooked = false,
  onClick 
}) => {
  const seatClass = isBooked ? 'booked' : isSelected ? 'occupied' : '';
  
  return (
    <div 
      className={`seat ${seatClass}`}
      onClick={isBooked ? undefined : onClick}
      title={`Місце ${seatIndex + 1} ${isBooked ? '(заброньовано)' : ''}`}
    >
      <div className="seat-base"></div>
      <div className="seat-armrest left"></div>
      <div className="seat-armrest right"></div>
      <div className="seat-number">{seatIndex + 1}</div>
    </div>
  );
};

// Компонент ряду крісел
const SeatRow: React.FC<{ 
  seatsInRow: number; 
  startIndex: number;
  selectedSeats: number[];
  bookedSeats: number[];
  onSeatClick: (seatIndex: number) => void;
}> = ({ 
  seatsInRow, 
  startIndex,
  selectedSeats,
  bookedSeats,
  onSeatClick
}) => {
  return (
    <div className="seat-row">
      {Array.from({ length: seatsInRow }).map((_, idx) => {
        const seatIndex = startIndex + idx;
        return (
          <Seat 
            key={seatIndex}
            seatIndex={seatIndex}
            isSelected={selectedSeats.includes(seatIndex)}
            isBooked={bookedSeats.includes(seatIndex)}
            onClick={() => onSeatClick(seatIndex)}
          />
        );
      })}
    </div>
  );
};

// Компонент залу
const Hall: React.FC<{ 
  hallId: number;
  movieId: number;
  name: string; 
  capacity: number;
}> = ({ 
  hallId,
  movieId,
  name, 
  capacity 
}) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [bookingMessage, setBookingMessage] = useState('');
  
  // Визначення оптимальної кількості рядів та крісел у ряду
  const seatsPerRow = Math.ceil(Math.sqrt(capacity));
  const rows = Math.ceil(capacity / seatsPerRow);
  
  // Отримання інформації про користувача з cookies
  const userEmail = Cookies.get('email') || '';
  const userName = Cookies.get('name') || '';
  
  // Отримання інформації про заброньовані місця
  useEffect(() => {
    // У реальному додатку тут потрібно буде зробити запит до сервера
    // для отримання списку заброньованих місць
    const fetchBookedSeats = () => {
      // Перевіряємо, чи є вже заброньовані місця в cookies
      const hallBookingKey = `hall_${hallId}_bookings`;
      const bookingsString = Cookies.get(hallBookingKey);
      
      if (bookingsString) {
        try {
          const bookings = JSON.parse(bookingsString);
          setBookedSeats(bookings);
        } catch (error) {
          console.error('Error parsing bookings', error);
        }
      }
    };
    
    fetchBookedSeats();
  }, [hallId]);
  
  const handleSeatClick = (seatIndex: number) => {
    setSelectedSeats(prev => {
      if (prev.includes(seatIndex)) {
        return prev.filter(id => id !== seatIndex);
      } else {
        return [...prev, seatIndex];
      }
    });
  };
  
  const handleBooking = async () => {
    // Перевірка чи користувач авторизований
    if (!userEmail || !userName) {
      setBookingStatus('error');
      setBookingMessage('Будь ласка, увійдіть в систему перед бронюванням місць');
      return;
    }
    
    // Підготовка даних для бронювання
    const bookingData: BookingData = {
      hallId,
      movieId,
      seatIndexes: selectedSeats,
      userEmail,
      userName
    };
    
    try {
      // В реальному додатку тут має бути відправка даних на сервер
      // await api.post('/bookings', bookingData);
      
      // Зберігаємо інформацію про бронювання в cookies
      const hallBookingKey = `hall_${hallId}_bookings`;
      const existingBookingsString = Cookies.get(hallBookingKey);
      let existingBookings: number[] = [];
      
      if (existingBookingsString) {
        try {
          existingBookings = JSON.parse(existingBookingsString);
        } catch (error) {
          console.error('Error parsing existing bookings', error);
        }
      }
      
      // Об'єднуємо старі та нові бронювання
      const updatedBookings = [...existingBookings, ...selectedSeats];
      
      // Зберігаємо в cookies
      Cookies.set(hallBookingKey, JSON.stringify(updatedBookings), { expires: 7 });
      
      // Зберігаємо детальну інформацію про бронювання
      const bookingDetailsKey = `booking_${hallId}_${Date.now()}`;
      Cookies.set(bookingDetailsKey, JSON.stringify({
        seats: selectedSeats,
        hall: hallId,
        movie: movieId,
        user: {
          email: userEmail,
          name: userName
        },
        date: new Date().toISOString()
      }), { expires: 30 });
      
      // Оновлюємо стан
      setBookedSeats(updatedBookings);
      setSelectedSeats([]);
      setBookingStatus('success');
      setBookingMessage('Місця успішно заброньовані!');
      
      // Скидаємо повідомлення через 3 секунди
      setTimeout(() => {
        setBookingStatus('idle');
        setBookingMessage('');
      }, 3000);
    } catch (error) {
      console.error('Booking error', error);
      setBookingStatus('error');
      setBookingMessage('Помилка при бронюванні місць. Спробуйте ще раз.');
    }
  };

  return (
    <div className="hall-container">
      <h2 className="hall-title">{name}</h2>
      
      <div className="screen-container">
        <div className="screen">
          <div className="screen-label">Екран</div>
        </div>
      </div>
      
      <div className="seats-container">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <SeatRow 
            key={rowIdx}
            seatsInRow={rowIdx === rows - 1 ? capacity - (rows - 1) * seatsPerRow : seatsPerRow}
            startIndex={rowIdx * seatsPerRow}
            selectedSeats={selectedSeats}
            bookedSeats={bookedSeats}
            onSeatClick={handleSeatClick}
          />
        ))}
      </div>
      
      <div className="booking-info">
        {bookingStatus !== 'idle' && (
          <div className={`booking-message ${bookingStatus}`}>
            {bookingMessage}
          </div>
        )}
        
        <p className="selected-count">Вибрано місць: {selectedSeats.length}</p>
        
        {!userEmail && selectedSeats.length > 0 && (
          <p className="login-reminder">Увійдіть у систему, щоб забронювати місця</p>
        )}
        
        {selectedSeats.length > 0 && (
          <button 
            className="booking-button"
            onClick={handleBooking}
          >
            Забронювати
          </button>
        )}
      </div>
    </div>
  );
};

const MovieInner: React.FC = () => {
  const { id } = useParams();
  const movieId = parseInt(id || '0');
  const { resultHalls, loading, error } = useFetchHallByMovie({ id: movieId });
  
  // Перевірка авторизації користувача
  const userEmail = Cookies.get('email');
  const userName = Cookies.get('name');
  const isLoggedIn = Boolean(userEmail && userName);

  if (loading) {
    return <div className="loading-message">Завантаження...</div>;
  }

  if (error) {
    return <div className="error-message">Помилка: {error}</div>;
  }

  if (!resultHalls || resultHalls.length === 0) {
    return <div className="empty-message">Для цього фільму немає доступних залів</div>;
  }

  return (
    <div className="movie-inner-container">
      <h1 className="page-title">Вибір місця</h1>
      
      {!isLoggedIn && (
        <div className="auth-notice">
          <p>Для бронювання місць необхідно увійти в систему</p>
        </div>
      )}
      
      {resultHalls.map((hall) => (
        <Hall 
          key={hall.data.hall.id} 
          hallId={hall.data.hall.id}
          movieId={movieId}
          name={hall.data.hall.name} 
          capacity={hall.data.hall.capacity} 
        />
      ))}
    </div>
  );
};

export default MovieInner;