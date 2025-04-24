import React from "react";
import useFetchAllMovies from "../hooks/useFetchAllMovies";
import MovieCard from "../components/movieCard";
import "../styles/MoviePage.sass";
const MoviePage: React.FC = () => {
  const { movies, fetchError } = useFetchAllMovies();
  console.log(movies);

  return (
    <div className="container movie-page">
      {movies?.map((el, key) => (
        <MovieCard
          id={key}
          title={el.title}
          description={el.description}
          genre={el.genre}
          duration={el.duration}
          poster_url={el.poster_url}
          release_date={el.release_date}
          director={el.director}
        />
      ))}
    </div>
  );
};

export default MoviePage;
