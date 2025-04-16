import React from "react";
import useFetchAllMovies from "../hooks/useFetchAllMovies";

const MoviePage: React.FC = () => {
  const { movies, fetchError } = useFetchAllMovies();
  console.log(movies);

  return (
    <div className="container">
        
    </div>
  );
};

export default MoviePage;
