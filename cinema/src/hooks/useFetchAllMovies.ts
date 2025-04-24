import { useState, useEffect } from "react";
import axios from "axios";
import api from "../api";

type movies = {
    id: number,
    title: string,
    description: string,
    genre: string,
    duration: number,
    poster_url: string, 
    release_date: string,
    director: string,
}

export default function useFetchAllMovies() {
    const [movies, setMovies] = useState<movies[]>();
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllMovies = async () => {
        try {
        
            const response = await api.get("/movies/");
            if (response.status == 200) {
                setMovies(response.data.data);
            }
        }
         catch (err: unknown) {
        if (axios.isAxiosError(err)) {
            console.log("Fetch error: ", err.message);
            setFetchError(err.message);
        } else {
            setFetchError("Unknown error");
        }
    } 
    }
    fetchAllMovies();
}, [])
console.log(typeof movies);
return {movies, fetchError};

}