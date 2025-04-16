import React, {useState, useEffect, useRef} from "react";
import "../styles/Landing.sass";
import useFetchAllMovies from "../hooks/useFetchAllMovies";
const LandingPage: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideRef = useRef(null);
    const {movies, fetchError} = useFetchAllMovies();

    const totalSlides = movies ? (movies.length > 3 ? movies.length - 2 : 1) : 0;

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
      };
    
      const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
      };

      useEffect(() => {
        if (slideRef.current) {
          slideRef.current.style.transition = 'transform 0.5s ease-in-out';
          slideRef.current.style.transform = `translateX(-${currentSlide * (100 / movies.length)}%)`;
        }
      }, [currentSlide, movies.length]);

    return(<div>
        <div className="background-banner container">
            <div className="site-title">
                <h1 className="site-header"></h1>
            </div>
            <div className="slider-container">
                <h1 className="slider-header"></h1>
                <div className="slider"></div>
            </div>
        </div>
    </div>)
}

export default LandingPage;