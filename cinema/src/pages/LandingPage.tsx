import React, { useState, useRef } from "react";
import "../styles/Landing.sass";
import useFetchAllMovies from "../hooks/useFetchAllMovies";
import { useNavigate } from "react-router-dom";
const LandingPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { movies, fetchError } = useFetchAllMovies();

  const visibleCount = 3; 
  const maxSlide = movies ? Math.max(0, movies.length - visibleCount) : 0;
  const navigate = useNavigate();
  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, maxSlide));
  };

  return (
    <div className="background-banner container">
      <div className="site-title">
        <h1 className="site-header"> - ABSLT CINEMA - </h1>
      </div>
      <div className="slider-container">
        <h1 className="slider-header">Новинки сезону</h1>
        <div className="slider">
          <button
            className="slider-prev"
            onClick={handlePrev}
            disabled={currentSlide === 0}
          >
            ←
          </button>
          <div className="slider-wrapper">
            <div
              className="slider-track"
              ref={sliderRef}
              style={{
                transform: `translateX(-${currentSlide * 75}%)`,
                transition: "transform 0.5s ease",
              }}
            >
              {movies?.map((movie) => (
                <div 
                  key={movie.id} 
                  className="slider-card"
                  style={{ 
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${movie.poster_url})` 
                  }}
                >
                  <div className="card-image-container">
                    <div
                      className="card-image"
                      style={{ backgroundImage: `url(${movie.poster_url})` }}
                    />
                  </div>
                  <div className="card-content" onClick={() => {navigate(`/movies/${movie.id}`)}}>
                    <h3>{movie.title || "Movie Title"}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            className="slider-next"
            onClick={handleNext}
            disabled={currentSlide >= maxSlide}
          >
            →
          </button>
        </div>
        {fetchError && <div className="error">Error loading movies</div>}
      </div>
    </div>
  );
};

export default LandingPage;