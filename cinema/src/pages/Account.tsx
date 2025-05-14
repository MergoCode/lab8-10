import React from "react";
import Cookies from "js-cookie";
import "../styles/Account.sass"
import { useNavigate } from "react-router-dom";
type user = {
  name: string | undefined;
  phone: string | undefined;
  email: string | undefined;
};

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const userData: user = {
    name: Cookies.get("name"),
    phone: Cookies.get("phone"),
    email: Cookies.get("email"),
  };
  const handleLogout = () => {
    for (const key in userData) {
        Cookies.remove(`${key}`)
    }
    Cookies.remove("token");
    navigate("/login");
  }

  return <div className="account-container">
    <h1 className="account-header">Особистий кабінет</h1>
    <div className="user-data">
        <h2 className="user-name">Ім'я користувача: {userData.name}</h2>
        <h3 className="user-phone">Телефон: {userData.phone}</h3>
        <h3 className="user-email">Е-мейл: {userData.email}</h3>
        <button className="user-tickets" onClick={() => {navigate("/tickets")}}>
        Перейти до квитків
    </button>
        <button className="user-tickets" onClick={handleLogout}>
        Вийти з акаунту
    </button>
    </div>
    
  </div>;
};
export default AccountPage;
