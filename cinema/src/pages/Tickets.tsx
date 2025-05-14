import React from "react";
import Cookies from "js-cookie";
import Ticket from "../components/Ticket";

const TicketsPage: React.FC = () => {
    const getBookingCookies = () => {
        const allCookies = Cookies.get(); 
        const filtered = Object.entries(allCookies).filter(([key]) =>
          key.includes('booking_')
        );
      
        return Object.fromEntries(filtered);
      };
    const allBookingsObj = getBookingCookies();
    const allBookings = [];
    for (const key in allBookingsObj) {
        allBookings.push(JSON.parse(allBookingsObj[key]));
    }
    console.log(allBookings);

    return(<div>
        {allBookings ? allBookings.map(el => <Ticket hall={el.hall} seats={el.seats} user={el.user} movie={el.movie} date={el.date}/>) : (<p>Немає квитків</p>)}
    </div>);
}

export default TicketsPage;