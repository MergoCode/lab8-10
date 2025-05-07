import { useState, useEffect } from "react";
import api from "../api";
import axios from "axios";

type Hall = {
    id: number,
    name: string,
    capacity: number
}

type Props = {
    id: number
} 

export default function useFetchHallByMovie({ id }: Props) {
    const [hallIds, setHallIds] = useState<number[]>([]);
    const [resultHalls, setResultHalls] = useState<Hall[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Крок 1: Отримуємо список ID залів
                const hallIdsResponse = await api.get(`/halls-movies/movie/${id}`);
                if (!isMounted) return;
                
                if (hallIdsResponse.status === 200) {
                    const ids = hallIdsResponse.data;
                    setHallIds(ids);
                    
                    // Крок 2: Отримуємо дані для кожного ID
                    const hallsData: Hall[] = [];
                    for (const hallId of ids) {
                        const hallResponse = await api.get(`/halls/${hallId}`);
                        if (!isMounted) return;
                        
                        if (hallResponse.status === 200) {
                            hallsData.push(hallResponse.data);
                        }
                    }
                    
                    setResultHalls(hallsData);
                }
            } catch (err) {
                if (!isMounted) return;
                
                if (axios.isAxiosError(err)) {
                    setError(`Error happened: ${err.message}`);
                    console.log("Error happened: ", err.message);
                } else {
                    setError("Unknown error occurred");
                    console.log("Unknown error occurred");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        fetchData();
        
        // Функція очищення для запобігання оновлення стану після розмонтування
        return () => {
            isMounted = false;
        };
    }, [id]); // Залежність тільки від id

    return { resultHalls, loading, error };
}