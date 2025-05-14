import React from "react";
import Cookies from "js-cookie";
import Ticket from "../components/Ticket";
import "../styles/Ticket.sass";
const TicketsPage: React.FC = () => {
  const getBookingCookies = () => {
    const allCookies = Cookies.get();
    const filtered = Object.entries(allCookies).filter(([key]) =>
      key.includes("booking_")
    );

    return Object.fromEntries(filtered);
  };
  const allBookingsObj = getBookingCookies();
  const allBookings = [];
  for (const key in allBookingsObj) {
    allBookings.push(JSON.parse(allBookingsObj[key]));
  }
  console.log(allBookings);

  return (
    <div className="tickets-container">
      <h1 className="tickets-header">Ваші Квитки</h1>
      {allBookings ? (
        allBookings.map((el) => (
          <Ticket
            sessionId={el.sessionId}
            movieTitle={el.movieTitle}
            hallName={el.hallName}
            startTime={el.startTime}
            seats={el.seats}
            price={el.price}
          />
        ))
      ) : (
        <p>Немає квитків</p>
      )}
    </div>
  );
};

export default TicketsPage;
