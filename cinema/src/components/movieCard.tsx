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
};

const MovieCard: React.FC<CardProps> = ({
    id,
  title,
  description,
  genre,
  duration,
  poster_url,
  release_date,
}) => {
    const navigate = useNavigate();


  return <div onClick={() => {navigate(`/movies/${id}`)}} className="col-4 movie-card">
    <div className="img-container-card">
    <img className="card-img" src={poster_url} alt="" />
    </div>
    <h2 className="card-title">{title}</h2>
    
    <p className="card-genre">Жанр: {genre}</p>
    <p className="card-description">{description}</p>
    <div className="card-params">
    <p className="card-p">{duration}</p>
    <p className="card-p">{release_date}</p>
    </div>
  </div>;
};

export default MovieCard;
