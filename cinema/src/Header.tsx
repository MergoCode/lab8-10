import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Layout.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const endpoint = location.pathname.split("/")[1];

  const quizRef = useRef<HTMLSpanElement>(null);
  const catalogRef = useRef<HTMLSpanElement>(null);
  const registerRef = useRef<HTMLSpanElement>(null);
  const todoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const array = [quizRef, catalogRef, registerRef, todoRef];
    console.log("Current endpoint:", endpoint);

    array.forEach((item) => item.current?.classList.remove("active-link"));

    array.forEach((item) => {
      if (item.current?.id === endpoint) {
        item.current.classList.add("active-link");
      }
    });
  }, [endpoint]);

  const redirect = (link: string) => {
    navigate(link);
  };

  return (
    <header>
      <span onClick={() => redirect("game")} id="game" ref={quizRef}>
        Films
      </span>
      <span onClick={() => redirect("catalog")} id="catalog" ref={catalogRef}>
        Shop
      </span>
      
    </header>
  );
};

export default Header;
