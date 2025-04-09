import React from "react";
import useFetchAllMovies from "../hooks/useFetchAllMovies";


const MoviePage: React.FC = () => {

    const {movies, fetchError} = useFetchAllMovies();
    console.log(movies);

    return(<div>
        Movies
    </div>);
}

export default MoviePage;