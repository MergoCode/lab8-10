import React from "react";
import useFetchAllMovies from "../hooks/useFetchAllMovies";
import "../styles/Ticket.sass";
import { useNavigate } from "react-router-dom";
/* 
{"sessionId":1,
"movieTitle":"Початок",
"hallName":"Перший зал",
"startTime":"2025-05-08T15:30:00.000Z",
"seats":[
{"id":17,"row":2,"seat_number":7}
],
"price":"200.00"}
*/
type seat = {
    id: number,
    row: number,
    seat_number: number
}
type PageProps = {
    sessionId: number,
    movieTitle: string,
    hallName: string,
    startTime: string,
    seats: seat[],
    price: string
}


const Ticket: React.FC<PageProps> = ({ sessionId, movieTitle, hallName, startTime, seats, price }) => {
  const { movies } = useFetchAllMovies();
  console.log(movieTitle);
  const navigate = useNavigate();
  console.log(movies);
  const movieData = movies?.find((el) => (el.title = movieTitle));
  console.log(sessionId);
  return (
    <div className="ticket">
      <div className="left-half">
        <div className="movie">
          <h1>{movieData?.title}</h1>
        </div>
        <div className="data">
            <div className="half">
          <p>Місця: {seats.map(el => `Місце: ${el.seat_number}, Ряд: ${el.row}`).join(", ")}</p>
          <p>Сеанс: {sessionId}</p>
          <p>{hallName}</p>
            </div>
            <div className="half">
          <p>Ціна: {price}</p>
          <p>Дата: {startTime.split("T")[0]}</p>
          <p>Час: {startTime.split("T")[1].slice(0, 5)}</p>
            </div>

        </div>
      </div>
      <div className="right-half">
        <div className="stripe" onClick={() => {navigate(`/movies/${movieData?.id}`)}}></div>
      </div>
    </div>
  );
};

export default Ticket;
