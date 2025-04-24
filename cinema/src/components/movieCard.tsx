import React from "react";
import "../styles/movieCard.sass";
import { useNavigate } from "react-router-dom";
type CardProps = {
    id: number,
  title: string;
  description: string;
  genre: string;
  duration: number;
  poster_url: string;
  release_date: string;
  director: string;
};

const MovieCard: React.FC<CardProps> = ({
    id,
  title,
  description,
  genre,
  duration,
  poster_url,
  release_date,
  director,
}) => {
    const navigate = useNavigate();


  return <div
  className="col-10 movie-card"
  style={{ backgroundImage: `url(${poster_url})` }}
>
  <div className="movie-content">
    <div className="card-img-container">
      <img src={poster_url} alt="" />
    </div>
    <div className="card-content-container">
    <h2>{title}</h2>
    <p>{genre} • {duration} хв • {new Date(release_date).getFullYear()} • {director}</p>
    <p>{description}</p>
    <div className="button-block">
    <button onClick={() => {navigate(`/movies/${id}`)}} className="card-button">Перейти</button>
    </div>
    </div>
  </div>
</div>;
};

export default MovieCard;
