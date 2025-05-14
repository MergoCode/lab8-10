import React from "react";
import useFetchAllMovies from "../hooks/useFetchAllMovies";
import "../styles/Ticket.sass"
type Props = {
        seats: number[],
        hall: number,
        movie: number,
        user: {
            email: string,
            name: string,
        },
        date: string,
}

const Ticket: React.FC<Props> = ({seats, hall, movie, user, date}) => {
    const {movies} = useFetchAllMovies();
    console.log(movie);
    console.log(movies)
    const movieData = movies?.find(el => el.id = movie);
    return(<div className="ticket">
        <div className="movie">
            <h1>{movieData?.title}</h1>
        </div>
        <div className="data">
            
            <p>Місця: {seats}</p>
            <p>Зал: {hall}</p>
            <p>Ім'я: {user.name}</p>
            <p>Дата: {date}</p>
        </div>
    </div>);
}

export default Ticket;