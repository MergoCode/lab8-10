import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Layout.sass";
import Cookies from "js-cookie";
interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const handleAccountClick = () => {
    if (!token) {
      navigate('/login');
    } else {
      navigate('/account')
    }
  }
  return (
    <>
      <header className="header">
        <div className="header-half logo-block">
          <img src="logo.svg" alt="" onClick={() => {navigate("/")}}/>
          <div className="filler-4"></div>
        </div>
        <div className="header-half">
          <p
            onClick={() => {
              navigate("/movies");
            }}
            className="header-link"
          >
            В прокаті
          </p>
          <p
            onClick={() => {
              navigate("/tickets");
            }}
            className="header-link"
          >
            Квитки
          </p>
          <p
            onClick={() => {
              navigate("/login");
            }}
            className="header-link"
          >
          Логін
          </p>
          <p
            onClick={handleAccountClick}
            className="header-link"
          >
            Акаунт
          </p>
          {/* <p
            onClick={() => {
              navigate("/login");
            }}
            className="header-link"
          >
            Логін
          </p> */}
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-link">Privacy Policy</p>
          <img src="logo.svg" alt="" onClick={() => {navigate("/")}}/>
          <p className="footer-link">FAQ</p>
        </div>
      </footer>
    </>
  );
};

export default Layout;
